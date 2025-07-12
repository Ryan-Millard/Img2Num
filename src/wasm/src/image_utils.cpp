#include "image_utils.h"
#include <emscripten/emscripten.h>
#include <stdint.h>
#include <iostream>

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
	void invert_image(uint8_t* ptr, int length) {
		for (int i = 0; i < length; i += 4) {
			ptr[i + 0] = 255 - ptr[i + 0]; // R
			ptr[i + 1] = 255 - ptr[i + 1]; // G
			ptr[i + 2] = 255 - ptr[i + 2]; // B
											// ptr[i + 3] = A (leave alpha as-is)
		}
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
		std::cout << "bucket_midpoint = " << bucket_midpoint << std::endl;
		bucket_midpoint = ((bucket - 1) * region_size) + (region_size / 2);
	}
	
	return bucket_midpoint;
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
	void threshold_image(uint8_t* ptr, int length, int num_thresholds) {
		int region_size = 255 / num_thresholds;
		for (int i = 0; i < length; i += 4) {
			ptr[i + 0] = quantize(ptr[i + 0], region_size);
			ptr[i + 1] = quantize(ptr[i + 1], region_size);
			ptr[i + 2] = quantize(ptr[i + 2], region_size);
		}
	}
}

extern "C" {
	EMSCRIPTEN_KEEPALIVE
	void black_threshold_image(uint8_t* ptr, int length) {
		int threshold = 128;
		bool R;
		bool B;
		bool G;
		for (int i = 0; i < length; i += 4) {
			R = ptr[i + 0] < threshold;
			B = ptr[i + 1] < threshold;
			G = ptr[i + 2] < threshold;

			if (R && B && G)
			{
				ptr[i + 0] = 0;
				ptr[i + 1] = 0;
				ptr[i + 2] = 0;
			}
		}
	}
}

//struct Pixel
//{
//	int r, g, b;
//};
//
//centroid[] get_centroids(int num_per_256, window_size) {
//	int interval = 256 / num_per_256;
//	int c_i = 0;
//	Pixel[] centroids = Pixel[12];
//
//	 interval determines the bounds of pixel values in colour space
//	 interval / 2 ensures the centroid is initialized at the midpoint of colour regions
//	 the midpoint closest to 255 will not be the midpoint of the region if num_per_256 is not in 2^n
//	for (int r = interval / 2; r < 256; r += interval) {
//		for (int g = interval / 2; g < 256; g += interval) {
//			for (int b = interval / 2; b < 256; b += interval) {
//				centroids[c_i++] = centroid(r, g, b, window_size);
//			}
//		}
//	}
//	return centroids;
//}
//
//extern "c" {
//	emscripten_keepalive
//	void k_means(uint8_t* ptr, int length) {
//		int window = 21;
//		centroid[] centroids = get_centroids(4, 21);
//	}
//
//
//}

//#include <cstdlib>
//#include <cmath>
//#include <ctime>
//#include <limits>
//#include <cstdint>
//#include <emscripten/emscripten.h>
//
//struct RGB {
//    float r, g, b;
//};
//
//float colorDistance(uint8_t* data, int i, const RGB& centroid) {
//    float dr = static_cast<float>(data[i]) - centroid.r;
//    float dg = static_cast<float>(data[i + 1]) - centroid.g;
//    float db = static_cast<float>(data[i + 2]) - centroid.b;
//    return dr * dr + dg * dg + db * db;
//}
//
//extern "C" {
//
//    EMSCRIPTEN_KEEPALIVE
//        void kmeans_clustering(uint8_t* data, int width, int height, int k, int max_iter = 100) {
//        const int num_pixels = width * height;
//        const int stride = 3; // RGB
//
//        std::vector<RGB> centroids(k);
//        std::vector<int> labels(num_pixels, 0);
//        std::vector<int> counts(k, 0);
//
//        srand(static_cast<unsigned int>(time(nullptr)));
//
//        // Initialize centroids randomly (read directly from data)
//        for (int i = 0; i < k; ++i) {
//            int idx = (rand() % num_pixels) * stride;
//            centroids[i] = {
//                static_cast<float>(data[idx]),
//                static_cast<float>(data[idx + 1]),
//                static_cast<float>(data[idx + 2])
//            };
//        }
//
//        for (int iter = 0; iter < max_iter; ++iter) {
//            bool changed = false;
//
//            // Assignment step
//            for (int i = 0; i < num_pixels; ++i) {
//                int idx = i * stride;
//                float min_dist = std::numeric_limits<float>::max();
//                int best_cluster = 0;
//
//                for (int j = 0; j < k; ++j) {
//                    float dist = colorDistance(data, idx, centroids[j]);
//                    if (dist < min_dist) {
//                        min_dist = dist;
//                        best_cluster = j;
//                    }
//                }
//
//                if (labels[i] != best_cluster) {
//                    changed = true;
//                    labels[i] = best_cluster;
//                }
//            }
//
//            if (!changed) {
//                for (int i = 0; i < num_pixels; ++i) {
//                    int cluster = labels[i];
//                    int idx = i * stride;
//                    data[idx] = static_cast<uint8_t>(centroids[cluster].r);
//                    data[idx + 1] = static_cast<uint8_t>(centroids[cluster].g);
//                    data[idx + 2] = static_cast<uint8_t>(centroids[cluster].b);
//                }
//                break;
//            }
//
//            // Clear centroids and counts
//            for (int j = 0; j < k; ++j) {
//                centroids[j] = { 0, 0, 0 };
//                counts[j] = 0;
//            }
//
//            // Update centroids (accumulate directly)
//            for (int i = 0; i < num_pixels; ++i) {
//                int idx = i * stride;
//                int cluster = labels[i];
//                centroids[cluster].r += data[idx];
//                centroids[cluster].g += data[idx + 1];
//                centroids[cluster].b += data[idx + 2];
//                counts[cluster]++;
//            }
//
//            for (int j = 0; j < k; ++j) {
//                if (counts[j] > 0) {
//                    centroids[j].r /= counts[j];
//                    centroids[j].g /= counts[j];
//                    centroids[j].b /= counts[j];
//                }
//            }
//        }
//    }
//}


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
    void kmeans_clustering(uint8_t* data, int width, int height, int k, int max_iter = 100) {
        int num_pixels = width * height;
        std::cout << "width = " << width << "\nheight = " << height << "\nnum_pixels = " << num_pixels << std::endl;
        std::vector<RGB> pixels(num_pixels);
        std::vector<RGB> centroids(k);
        std::vector<int> labels(num_pixels, 0);

        // Step 1: Convert data to RGB float values
        for (int i = 0; i < num_pixels; ++i) {
            pixels[i] = {
                static_cast<float>(data[i * 3 + 0]),
                static_cast<float>(data[i * 3 + 1]),
                static_cast<float>(data[i * 3 + 2])
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
			data[i * 3 + 0] = static_cast<uint8_t>(centroids[cluster].r);
			data[i * 3 + 1] = static_cast<uint8_t>(centroids[cluster].g);
			data[i * 3 + 2] = static_cast<uint8_t>(centroids[cluster].b);
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