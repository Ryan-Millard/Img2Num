// TODO: fix ignored alpha channels for spatial kmeans function
// TODO: Clean up comments & unused code

#include "image_utils.h"
#include <emscripten/emscripten.h>
#include <stdint.h>
#include <iostream>
#include "Image.h"
#include "RGBAPixel.h"
#include "PixelConverters.h"

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
		void invert_image(uint8_t* ptr, int width, int height) {
			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				p.red = 255 - p.red;
				p.blue = 255 - p.blue;
				p.green = 255 - p.green;
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}
}

uint8_t quantize(uint8_t value, uint8_t region_size) {
	uint8_t bucket = value / region_size;		// Range [0 : num_thresholds - 1] Narrowing to colour boundary

	/* NEED TO FIX OVERFLOW */

	uint8_t bucket_region = (bucket * region_size);
	uint8_t bucket_midpoint = bucket_region + (region_size / 2);		// Map to threshold region's midpoint
																		// In case of bucket_midpoint overflow: revert to a smaller bucket than the largest possible value
	if (bucket_midpoint - bucket_region < 0)
	{
		// std::cout << "bucket_midpoint = " << bucket_midpoint << std::endl;
		bucket_midpoint = ((bucket - 1) * region_size) + (region_size / 2);
	}

	return bucket_midpoint;
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
		void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
			const uint8_t REGION_SIZE(255 / num_thresholds); // Size of buckets per colour

			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				p.red = quantize(p.red, REGION_SIZE);
				p.green = quantize(p.green, REGION_SIZE);
				p.blue = quantize(p.blue, REGION_SIZE);
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
		void black_threshold_image(uint8_t* ptr, const int width, const int height, const int threshold) {
			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				const bool R{p.red < threshold};
				const bool G{p.green < threshold};
				const bool B{p.blue < threshold};
				if (R && B && G) {
					p.setGray(0);
				}
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}
}

#include <vector>
#include <cstdlib>
#include <cmath>
#include <limits>
#include <ctime>
#include <cstdint>
#include <iostream>

struct RGB {
	float r, g, b;
};

float colorDistance(const RGB& a, const RGB& b) {
	return std::sqrt((a.r - b.r) * (a.r - b.r) +
			(a.g - b.g) * (a.g - b.g) +
			(a.b - b.b) * (a.b - b.b));
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
		void kmeans_clustering(uint8_t* data, int width, int height, int k, int max_iter) {
			int num_pixels = width * height;
			std::vector<RGB> pixels(num_pixels);
			std::vector<RGB> centroids(k);
			std::vector<int> labels(num_pixels, 0);

			// Step 1: Convert data to RGB float values
			for (int i = 0; i < num_pixels; ++i) {
				pixels[i] = {
					static_cast<float>(data[i * 4 + 0]),
					static_cast<float>(data[i * 4 + 1]),
					static_cast<float>(data[i * 4 + 2])
				};
			}

			// Step 2: Initialize centroids randomly
			srand(static_cast<unsigned int>(time(nullptr)));
			for (int i = 0; i < k; ++i) {
				int idx = rand() % num_pixels;
				centroids[i] = pixels[idx];
			}

			// Step 3: Run k-means iterations
			for (int iter = 0; iter < max_iter; ++iter) {
				bool changed = false;

				// Assignment step
				for (int i = 0; i < num_pixels; ++i) {
					float min_dist = std::numeric_limits<float>::max();
					int best_cluster = 0;

					for (int j = 0; j < k; ++j) {
						float dist = colorDistance(pixels[i], centroids[j]);
						if (dist < min_dist) {
							min_dist = dist;
							best_cluster = j;
						}
					}

					if (labels[i] != best_cluster) {
						changed = true;
						labels[i] = best_cluster;
					}
				}

				// Stop if no changes
				if (!changed) break;

				// Update step
				std::vector<RGB> new_centroids(k, { 0, 0, 0 });
				std::vector<int> counts(k, 0);

				for (int i = 0; i < num_pixels; ++i) {
					int cluster = labels[i];
					new_centroids[cluster].r += pixels[i].r;
					new_centroids[cluster].g += pixels[i].g;
					new_centroids[cluster].b += pixels[i].b;
					counts[cluster]++;
				}

				for (int j = 0; j < k; ++j) {
					/* 
					   A centroid may become a dead centroid if it never gets pixels assigned to it.
					   May be good idea to reinitialize these dead centroids.
					   */
					if (counts[j] > 0) {
						centroids[j].r = new_centroids[j].r / counts[j];
						centroids[j].g = new_centroids[j].g / counts[j];
						centroids[j].b = new_centroids[j].b / counts[j];
					}
				}
			} 

			// Write the final centroid values to each pixel in the cluster
			//std::cout << "centroids.size() = " << centroids.size() << "new_centroids.size() = " << new_centroids.size() << 
			for (int i = 0; i < num_pixels; ++i) {
				int cluster = labels[i];
				data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].r);
				data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].g);
				data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].b);
			}
			//return labels;
		}
}

struct RGBXY {
	float r, g, b;
	float x, y;
};

float colorSpatialDistance(const RGBXY& a, const RGBXY& b, float spatial_weight) {
	float color_dist = (a.r - b.r) * (a.r - b.r) +
		(a.g - b.g) * (a.g - b.g) +
		(a.b - b.b) * (a.b - b.b);

	float spatial_dist = (a.x - b.x) * (a.x - b.x) +
		(a.y - b.y) * (a.y - b.y);

	return std::sqrt(color_dist + spatial_weight * spatial_dist);
}
extern "C" {
	EMSCRIPTEN_KEEPALIVE
		void kmeans_clustering_spatial(uint8_t* data, int width, int height, int k, int max_iter = 100, float spatial_weight = 1.0f) {
			int num_pixels = width * height;
			std::vector<RGBXY> pixels(num_pixels);
			std::vector<RGBXY> centroids(k);
			std::vector<int> labels(num_pixels, 0);

			// Initialize pixels with color + spatial coords
			for (int i = 0; i < height; ++i) {
				for (int j = 0; j < width; ++j) {
					int idx = i * width + j;
					pixels[idx] = {
						static_cast<float>(data[idx * 3 + 0]),
						static_cast<float>(data[idx * 3 + 1]),
						static_cast<float>(data[idx * 3 + 2]),
						static_cast<float>(j),  // x
						static_cast<float>(i)   // y
					};
				}
			}

			srand(static_cast<unsigned int>(time(nullptr)));
			for (int i = 0; i < k; ++i) {
				int idx = rand() % num_pixels;
				centroids[i] = pixels[idx];
			}

			for (int iter = 0; iter < max_iter; ++iter) {
				bool changed = false;

				// Assignment step
				for (int i = 0; i < num_pixels; ++i) {
					float min_dist = std::numeric_limits<float>::max();
					int best_cluster = 0;

					for (int j = 0; j < k; ++j) {
						float dist = colorSpatialDistance(pixels[i], centroids[j], spatial_weight);
						if (dist < min_dist) {
							min_dist = dist;
							best_cluster = j;
						}
					}

					if (labels[i] != best_cluster) {
						changed = true;
						labels[i] = best_cluster;
					}
				}

				if (!changed) break;

				// Update step
				std::vector<RGBXY> new_centroids(k, { 0,0,0,0,0 });
				std::vector<int> counts(k, 0);

				for (int i = 0; i < num_pixels; ++i) {
					int cluster = labels[i];
					new_centroids[cluster].r += pixels[i].r;
					new_centroids[cluster].g += pixels[i].g;
					new_centroids[cluster].b += pixels[i].b;
					new_centroids[cluster].x += pixels[i].x;
					new_centroids[cluster].y += pixels[i].y;
					counts[cluster]++;
				}

				for (int j = 0; j < k; ++j) {
					if (counts[j] > 0) {
						centroids[j].r = new_centroids[j].r / counts[j];
						centroids[j].g = new_centroids[j].g / counts[j];
						centroids[j].b = new_centroids[j].b / counts[j];
						centroids[j].x = new_centroids[j].x / counts[j];
						centroids[j].y = new_centroids[j].y / counts[j];
					}
				}
			}

			// Assign clustered colors back to data
			for (int i = 0; i < num_pixels; ++i) {
				int cluster = labels[i];
				data[i * 3 + 0] = static_cast<uint8_t>(centroids[cluster].r);
				data[i * 3 + 1] = static_cast<uint8_t>(centroids[cluster].g);
				data[i * 3 + 2] = static_cast<uint8_t>(centroids[cluster].b);
			}
		}
}