#include "kmeans.h"
#include "Image.h"
#include "LABAPixel.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include "cielab.h"
#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <functional>
#include <limits>
#include <numeric>
#include <random>
#include <vector>

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB{0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB{1};

// The K-Means++ Initialization Function
template <typename PixelT>
void kMeansPlusPlusInit(const ImageLib::Image<PixelT> &pixels,
                        ImageLib::Image<PixelT> &out_centroids, int k) {
  std::vector<PixelT> centroids;

  int num_pixels = pixels.getSize();
  // Random number generator setup
  std::random_device rd;
  std::mt19937 gen(rd());

  // --- Step 1: Choose the first centroid uniformly at random ---
  std::uniform_int_distribution<> dis(0, num_pixels - 1);
  int first_index = dis(gen);
  centroids.push_back(pixels[first_index]);

  // Vector to store the squared distance of each pixel to its NEAREST existing
  // centroid. Initialize with max double so the first distance calculation
  // always updates it.
  std::vector<double> min_dist_sq(num_pixels,
                                  std::numeric_limits<double>::max());

  // --- Step 2 & 3: Repeat until we have k centroids ---
  for (int i = 1; i < k; ++i) {

    double sum_dist_sq = 0.0;

    // Update distances relative to the LAST added centroid (centroids.back())
    // We don't need to recheck previous centroids; min_dist_sq already holds
    // the best distance to them.
    for (int j = 0; j < num_pixels; ++j) {
      double d = PixelT::colorDistance(pixels[j], centroids.back());

      // If this new centroid is closer than the previous best, update the min
      // distance
      if (d < min_dist_sq[j]) {
        min_dist_sq[j] = d;
      }
      sum_dist_sq += min_dist_sq[j];
    }

    // --- Step 3: Choose new center with probability proportional to D(x)^2 ---
    // We use a weighted random selection (Roulette Wheel Selection)
    std::uniform_real_distribution<> dist_selector(0.0, sum_dist_sq);
    double random_value = dist_selector(gen);

    double current_sum = 0.0;
    int selected_index = -1;

    // Iterate to find the pixel corresponding to the random_value
    for (int j = 0; j < num_pixels; ++j) {
      current_sum += min_dist_sq[j];
      if (current_sum >= random_value) {
        selected_index = j;
        break;
      }
    }

    // Fallback for floating point rounding errors (pick last one if loop
    // finishes)
    if (selected_index == -1) {
      selected_index = num_pixels - 1;
    }

    centroids.push_back(pixels[selected_index]);
  }

  std::copy(centroids.begin(), centroids.end(), out_centroids.begin());
}

void kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
            const int32_t width, const int32_t height, const int32_t k,
            const int32_t max_iter, const uint8_t color_space) {
  ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
  pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
  const int32_t num_pixels{pixels.getSize()};

  // width = k, height = 1
  // k centroids, initialized to rgba(0,0,0,255)
  // Init of each pixel is from default in Image constructor
  ImageLib::Image<ImageLib::RGBAPixel<float>> centroids{k, 1};
  ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab{k, 1};
  std::vector<int32_t> labels(num_pixels, 0);

  ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(),
                                                  pixels.getHeight());
  if (color_space == COLOR_SPACE_OPTION_CIELAB) {
    for (int i{0}; i < pixels.getSize(); ++i) {
      rgb_to_lab<float, float>(pixels[i], lab[i]);
    }
  }

  // Step 2: Initialize centroids randomly

  switch (color_space) {
  case COLOR_SPACE_OPTION_RGB: {
    kMeansPlusPlusInit<ImageLib::RGBAPixel<float>>(pixels, centroids, k);
    break;
  }
  case COLOR_SPACE_OPTION_CIELAB: {
    kMeansPlusPlusInit<ImageLib::LABAPixel<float>>(lab, centroids_lab, k);
    break;
  }
  }

  // Step 3: Run k-means iterations

  // Assignment step
  for (int32_t iter{0}; iter < max_iter; ++iter) {
    bool changed{false};

    // Iterate over pixels
    for (int32_t i{0}; i < num_pixels; ++i) {
      float min_color_dist{std::numeric_limits<float>::max()};
      int32_t best_cluster{0};

      // Iterate over centroids to find centroid with most similar color to
      // pixels[i]
      float dist;
      for (int32_t j{0}; j < k; ++j) {
        switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
          dist = ImageLib::RGBAPixel<float>::colorDistance(pixels[i],
                                                           centroids[j]);
          break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
          dist = ImageLib::LABAPixel<float>::colorDistance(lab[i],
                                                           centroids_lab[j]);
          break;
        }
        }
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
    ImageLib::Image<ImageLib::LABAPixel<float>> new_centroids_lab(k, 1, 0);
    std::vector<int32_t> counts(k, 0);

    for (int32_t i = 0; i < num_pixels; ++i) {
      int32_t cluster = labels[i];
      switch (color_space) {
      case COLOR_SPACE_OPTION_RGB: {
        new_centroids[cluster].red += pixels[i].red;
        new_centroids[cluster].green += pixels[i].green;
        new_centroids[cluster].blue += pixels[i].blue;
        break;
      }
      case COLOR_SPACE_OPTION_CIELAB: {
        new_centroids_lab[cluster].l += lab[i].l;
        new_centroids_lab[cluster].a += lab[i].a;
        new_centroids_lab[cluster].b += lab[i].b;
        break;
      }
      }
      counts[cluster]++;
    }

    for (int32_t j = 0; j < k; ++j) {
      /*
         A centroid may become a dead centroid if it never gets pixels assigned
         to it. May be good idea to reinitialize these dead centroids.
      */
      if (counts[j] > 0) {
        switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
          centroids[j].red = new_centroids[j].red / counts[j];
          centroids[j].green = new_centroids[j].green / counts[j];
          centroids[j].blue = new_centroids[j].blue / counts[j];
          break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
          centroids_lab[j].l = new_centroids_lab[j].l / counts[j];
          centroids_lab[j].a = new_centroids_lab[j].a / counts[j];
          centroids_lab[j].b = new_centroids_lab[j].b / counts[j];
          break;
        }
        }
      }
    }
  }

  if (color_space == COLOR_SPACE_OPTION_CIELAB) {
    for (int32_t i{0}; i < k; ++i) {
      lab_to_rgb<float, float>(centroids_lab[i], centroids[i]);
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
