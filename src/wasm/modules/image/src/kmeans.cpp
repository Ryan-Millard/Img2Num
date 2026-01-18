#include "kmeans.h"
#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <limits>
#include <vector>

static inline float colorDistance(const ImageLib::RGBAPixel<float> &a,
                                  const ImageLib::RGBAPixel<float> &b) {
  return std::sqrt((a.red - b.red) * (a.red - b.red) +
                   (a.green - b.green) * (a.green - b.green) +
                   (a.blue - b.blue) * (a.blue - b.blue));
}

void kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
            const int32_t width, const int32_t height, const int32_t k,
            const int32_t max_iter) {
  ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
  pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
  const int32_t num_pixels{pixels.getSize()};

  // width = k, height = 1
  // k centroids, initialized to rgba(0,0,0,255)
  // Init of each pixel is from default in Image constructor
  ImageLib::Image<ImageLib::RGBAPixel<float>> centroids{k, 1};
  std::vector<int32_t> labels(num_pixels, 0);

  // Step 2: Initialize centroids randomly
  srand(static_cast<uint32_t>(time(nullptr)));
  for (int32_t i{0}; i < k; ++i) {
    int32_t idx = rand() % num_pixels;
    centroids[i] = pixels[idx];
  }

  // Step 3: Run k-means iterations
  for (int32_t iter{0}; iter < max_iter; ++iter) {
    bool changed{false};

    // Assignment step
    // Iterate over pixels
    for (int32_t i{0}; i < num_pixels; ++i) {
      float min_color_dist{std::numeric_limits<float>::max()};
      int32_t best_cluster{0};

      // Iterate over centroids to find centroid with most similar color to
      // pixels[i]
      for (int32_t j{0}; j < k; ++j) {
        float dist{colorDistance(pixels[i], centroids[j])};
        if (dist < min_color_dist) {
          min_color_dist = dist;
          best_cluster = j;
        }
      }

      if (labels[i] != best_cluster) {
        changed = true;
        labels[i] = best_cluster;
      }
    }

    // Stop if no changes
    if (!changed) {
      break;
    }

    // Update step
    ImageLib::Image<ImageLib::RGBAPixel<float>> new_centroids(k, 1, 0);
    std::vector<int32_t> counts(k, 0);

    for (int32_t i = 0; i < num_pixels; ++i) {
      int32_t cluster = labels[i];
      new_centroids[cluster].red += pixels[i].red;
      new_centroids[cluster].green += pixels[i].green;
      new_centroids[cluster].blue += pixels[i].blue;
      counts[cluster]++;
    }

    for (int32_t j = 0; j < k; ++j) {
      /*
         A centroid may become a dead centroid if it never gets pixels assigned
         to it. May be good idea to reinitialize these dead centroids.
      */
      if (counts[j] > 0) {
        centroids[j].red = new_centroids[j].red / counts[j];
        centroids[j].green = new_centroids[j].green / counts[j];
        centroids[j].blue = new_centroids[j].blue / counts[j];
      }
    }
  }

  // Write the final centroid values to each pixel in the cluster
  for (int32_t i = 0; i < num_pixels; ++i) {
    const int32_t cluster = labels[i];
    out_data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].red);
    out_data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].green);
    out_data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].blue);
    out_data[i * 4 + 3] = 255;
  }

  // Write labels to out_labels
  std::memcpy(out_labels, labels.data(), labels.size() * sizeof(int32_t));
}

/*
 *BUGGY CODE BELOW - one of the channels is poorly indexed
 *
 * TODO: The kmeans algorithm actually ignores the values of alpha where it
 *should actually be taken into account.
 */

struct RGBXY {
  float r, g, b;
  float x, y;
};

float colorSpatialDistance(const RGBXY &a, const RGBXY &b,
                           float spatial_weight) {
  float color_dist = (a.r - b.r) * (a.r - b.r) + (a.g - b.g) * (a.g - b.g) +
                     (a.b - b.b) * (a.b - b.b);

  float spatial_dist = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);

  return std::sqrt(color_dist + spatial_weight * spatial_dist);
}

void kmeans_clustering_spatial(uint8_t *data, int32_t width, int32_t height,
                               int32_t k, int32_t max_iter,
                               float spatial_weight) {
  int32_t num_pixels = width * height;
  std::vector<RGBXY> pixels(num_pixels);
  std::vector<RGBXY> centroids(k);
  std::vector<int32_t> labels(num_pixels, 0);

  // Initialize pixels with color + spatial coords
  for (int32_t i = 0; i < height; ++i) {
    for (int32_t j = 0; j < width; ++j) {
      int32_t idx = i * width + j;
      pixels[idx] = RGBXY{.r = static_cast<float>(data[idx * 4 + 0]) /
                               255, // normalize 0 -1
                          .g = static_cast<float>(data[idx * 4 + 1]) / 255,
                          .b = static_cast<float>(data[idx * 4 + 2]) / 255,
                          .x = static_cast<float>(j) / width, // normalize 0 - 1
                          .y = static_cast<float>(i) / height};
    }
  }

  srand(static_cast<uint32_t>(time(nullptr)));
  for (int32_t i = 0; i < k; ++i) {
    int32_t idx = rand() % num_pixels;
    centroids[i] = pixels[idx];
  }

  for (int32_t iter = 0; iter < max_iter; ++iter) {
    bool changed = false;

    // Assignment step
    for (int32_t i = 0; i < num_pixels; ++i) {
      float min_dist = std::numeric_limits<float>::max();
      int32_t best_cluster = 0;

      for (int32_t j = 0; j < k; ++j) {
        float dist =
            colorSpatialDistance(pixels[i], centroids[j], spatial_weight);
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

    if (!changed)
      break;

    // Update step
    std::vector<RGBXY> new_centroids(k, {0, 0, 0, 0, 0});
    std::vector<int32_t> counts(k, 0);

    for (int32_t i = 0; i < num_pixels; ++i) {
      int32_t cluster = labels[i];
      new_centroids[cluster].r += pixels[i].r;
      new_centroids[cluster].g += pixels[i].g;
      new_centroids[cluster].b += pixels[i].b;
      new_centroids[cluster].x += pixels[i].x;
      new_centroids[cluster].y += pixels[i].y;
      counts[cluster]++;
    }

    for (int32_t j = 0; j < k; ++j) {
      if (counts[j] > 0) {
        centroids[j].r = new_centroids[j].r / counts[j];
        centroids[j].g = new_centroids[j].g / counts[j];
        centroids[j].b = new_centroids[j].b / counts[j];
        centroids[j].x = new_centroids[j].x / counts[j];
        centroids[j].y = new_centroids[j].y / counts[j];
      }
    }
  }
  // Assign clustered colors back to data (rescale pixel values 0 - 255)
  for (int32_t i = 0; i < num_pixels; ++i) {
    int32_t cluster = labels[i];
    data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].r * 255);
    data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].g * 255);
    data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].b * 255);
  }
}
