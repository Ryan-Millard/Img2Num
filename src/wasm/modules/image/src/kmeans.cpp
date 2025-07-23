// TODO: The kmeans algorithm actually ignores the values of alpha where it should actually be taken into account.

#include "kmeans.h"

float colorDistance(const RGB& a, const RGB& b) {
	return std::sqrt((a.r - b.r) * (a.r - b.r) +
			(a.g - b.g) * (a.g - b.g) +
			(a.b - b.b) * (a.b - b.b));
}

float colorDistance(const ImageLib::RGBAPixel<float>& a, const RGB& b) {
	return std::sqrt((a.red - b.r) * (a.red - b.r) +
			(a.green - b.g) * (a.green - b.g) +
			(a.blue - b.b) * (a.blue - b.b));
}

float colorDistance(const ImageLib::RGBAPixel<float>& a, const ImageLib::RGBAPixel<float>& b) {
	return std::sqrt((a.red - b.red) * (a.red - b.red) +
			(a.green - b.green) * (a.green - b.green) +
			(a.blue - b.blue) * (a.blue - b.blue));
}

void kmeans_clustering(uint8_t* data, int width, int height, int k, int max_iter) {
	int num_pixels = width * height;
	ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
	pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);

	// 1-D image (height = 1)
	ImageLib::Image<ImageLib::RGBAPixel<float>> centroids(k, 1); // k centroids, initialized to rgba(0,0,0,255)
																 // Init of each pixel is from default in Image constructor
	std::vector<int> labels(num_pixels, 0);

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
		// std::vector<RGB> new_centroids(k, { 0, 0, 0 });
		ImageLib::Image<ImageLib::RGBAPixel<float>> new_centroids(k, 1, 0);
		std::vector<int> counts(k, 0);

		for (int i = 0; i < num_pixels; ++i) {
			int cluster = labels[i];
			new_centroids[cluster].red += pixels[i].red;
			new_centroids[cluster].green += pixels[i].green;
			new_centroids[cluster].blue += pixels[i].blue;
			counts[cluster]++;
		}

		for (int j = 0; j < k; ++j) {
			/*
			   A centroid may become a dead centroid if it never gets pixels assigned to it.
			   May be good idea to reinitialize these dead centroids.
			   */
			if (counts[j] > 0) {
				centroids[j].red = new_centroids[j].red / counts[j];
				centroids[j].green = new_centroids[j].green / counts[j];
				centroids[j].blue = new_centroids[j].blue / counts[j];
			}
		}
	}

	// Write the final centroid values to each pixel in the cluster
	//std::cout << "centroids.size() = " << centroids.size() << "new_centroids.size() = " << new_centroids.size() << 
	for (int i = 0; i < num_pixels; ++i) {
		int cluster = labels[i];
		data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].red);
		data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].green);
		data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].blue);
	}
}

float colorSpatialDistance(const RGBXY& a, const RGBXY& b, float spatial_weight) {
	float color_dist = (a.r - b.r) * (a.r - b.r) +
		(a.g - b.g) * (a.g - b.g) +
		(a.b - b.b) * (a.b - b.b);

	float spatial_dist = (a.x - b.x) * (a.x - b.x) +
		(a.y - b.y) * (a.y - b.y);

	return std::sqrt(color_dist + spatial_weight * spatial_dist);
}

void kmeans_clustering_spatial(uint8_t* data, int width, int height, int k, int max_iter, float spatial_weight) {
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
