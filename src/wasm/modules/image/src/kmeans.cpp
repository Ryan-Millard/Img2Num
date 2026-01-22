#include "kmeans.h"
#include "Image.h"
#include "LABAPixel.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include "cielab.h"
#include <algorithm>
#include <atomic>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <functional>
#include <limits>
#include <numeric>
#include <random>
#include <thread>
#include <vector>

static inline float colorDistance(const ImageLib::RGBAPixel<float> &a,
                                  const ImageLib::RGBAPixel<float> &b) {
  // sqrt un-necessary
  return (a.red - b.red) * (a.red - b.red) +
         (a.green - b.green) * (a.green - b.green) +
         (a.blue - b.blue) * (a.blue - b.blue);
}

static inline float colorDistance(const ImageLib::LABAPixel<float> &a,
                                  const ImageLib::LABAPixel<float> &b) {
  // sqrt un-necessary
  return (a.l - b.l) * (a.l - b.l) + (a.a - b.a) * (a.a - b.a) +
         (a.b - b.b) * (a.b - b.b);
}

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB{0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB{1};

template <typename PixelT>
void _process_dist_per_centroid(const ImageLib::Image<PixelT> &pixels,
                                const ImageLib::Image<PixelT> &centroids,
                                std::vector<std::vector<float>> &output,
                                int start_centroid, int end_centroid) {
  // threads will not overlap - no need for mutex
  std::vector<float> _res(pixels.getPixelCount());
  for (int j{start_centroid}; j < end_centroid; ++j) {
    std::transform(pixels.begin(), pixels.end(), _res.begin(),
                   [&centroids, j](const PixelT &p) {
                     return colorDistance(p, centroids[j]);
                   });
    std::copy(_res.begin(), _res.end(), output[j].begin());
  }
}

template <typename PixelT>
void _apply_labels(const ImageLib::Image<PixelT> &pixels,
                   const std::vector<std::vector<float>> &distances,
                   std::vector<int> &labels, int start_pixel, int end_pixel,
                   int k, std::atomic<bool> &changed) {
  // threads don't overlap
  float min_color_dist{std::numeric_limits<float>::max()};
  int32_t best_cluster{0};
  for (int i{start_pixel}; i < end_pixel; ++i) {
    min_color_dist = std::numeric_limits<float>::max();
    best_cluster = 0;
    for (int j{0}; j < k; ++j) {
      if (distances[j][i] < min_color_dist) {
        min_color_dist = distances[j][i];
        best_cluster = j;
      }
    }
    if (labels[i] != best_cluster) {
      labels[i] = best_cluster;
      changed.store(true, std::memory_order_relaxed);
    }
  }
}

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
      double d = colorDistance(pixels[j], centroids.back());

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
            const int32_t max_iter, const uint8_t color_space,
            const uint8_t n_threads) {
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

  std::vector<std::thread> threads;

  int nthreads = std::clamp(static_cast<int>(n_threads), 1, k);

  int pixels_per_thread{num_pixels / nthreads};
  int centroids_per_thread{k / nthreads};

  // Step 2: Initialize centroids randomly
  // This does not give satisfactory initializations
  /*srand(static_cast<uint32_t>(time(nullptr)));
  for (int32_t i{0}; i < k; ++i) {
    int32_t idx = rand() % num_pixels;
    switch (color_space) {
      case COLOR_SPACE_OPTION_RGB : {
        centroids[i] = pixels[idx];
        break;
      }
      case COLOR_SPACE_OPTION_CIELAB : {
        centroids_lab[i] = lab[idx];
        break;
      }
    }
  }*/

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

  std::vector<std::vector<float>> distances;
  if (nthreads > 1) {
    distances.resize(k);
    for (auto &d : distances) {
      d.resize(num_pixels, std::numeric_limits<float>::max());
    }
  }

  // Assignment step
  for (int32_t iter{0}; iter < max_iter; ++iter) {
    bool changed{false};

    if (nthreads > 1) {
      for (int i = 0; i < nthreads; ++i) {

        int start_c{i * centroids_per_thread};
        int end_c{(i == nthreads - 1) ? k : (i + 1) * centroids_per_thread};

        switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
          threads.emplace_back(
              _process_dist_per_centroid<ImageLib::RGBAPixel<float>>,
              std::cref(pixels), std::cref(centroids), std::ref(distances),
              start_c, end_c);
          break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
          threads.emplace_back(
              _process_dist_per_centroid<ImageLib::LABAPixel<float>>,
              std::cref(lab), std::cref(centroids_lab), std::ref(distances),
              start_c, end_c);
          break;
        }
        }
      }

      // wait for threads to finish
      for (auto &thread : threads) {
        if (thread.joinable()) {
          thread.join();
        }
      }
      // std::cout << "Computed distances" << std::endl;
      threads.clear();

      // assign labels
      std::atomic<bool> changed_atomic{false};
      for (int i = 0; i < nthreads; ++i) {
        int start_pixel{i * pixels_per_thread};
        int end_pixel{(i == nthreads - 1) ? num_pixels
                                          : (i + 1) * pixels_per_thread};

        switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
          threads.emplace_back(_apply_labels<ImageLib::RGBAPixel<float>>,
                               std::cref(pixels), std::cref(distances),
                               std::ref(labels), start_pixel, end_pixel, k,
                               std::ref(changed_atomic));
          break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
          threads.emplace_back(_apply_labels<ImageLib::LABAPixel<float>>,
                               std::cref(lab), std::cref(distances),
                               std::ref(labels), start_pixel, end_pixel, k,
                               std::ref(changed_atomic));
          break;
        }
        }
      }
      // wait for threads to finish
      for (auto &thread : threads) {
        if (thread.joinable()) {
          thread.join();
        }
      }

      changed = changed_atomic.load();
      threads.clear();
    } else {
      // Iterate over pixels
      for (int32_t i{0}; i < num_pixels; ++i) {
        float min_color_dist{std::numeric_limits<float>::max()};
        int32_t best_cluster{0};

        // Iterate over centroids to find centroid with most similar color to
        // pixels[i]
        float dist;
        for (int32_t j{0}; j < k; ++j) {
          // float dist{colorDistance(pixels[i], centroids[j])};
          switch (color_space) {
          case COLOR_SPACE_OPTION_RGB: {
            dist = colorDistance(pixels[i], centroids[j]);
            break;
          }
          case COLOR_SPACE_OPTION_CIELAB: {
            dist = colorDistance(lab[i], centroids_lab[j]);
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

/*
 *BUGGY CODE BELOW - one of the channels is poorly indexed
 *
 * TODO: The kmeans algorithm actually ignores the values of alpha where it
 *should actually be taken into account.
 */

/* Remove for now
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
*/