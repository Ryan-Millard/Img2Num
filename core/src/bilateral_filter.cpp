#include "img2num.h"
#include "cielab.h"

#include <algorithm>
#include <climits>
#include <cmath>
#include <cstring>
#include <functional>
#include <vector>

static constexpr double SIGMA_RADIUS_FACTOR{3.0}; // 3 standard deviations
static constexpr int MAX_KERNEL_RADIUS{50};
// Max possible squared Euclidean distance in a 3-channel 8-bit image: 255^2 * 3
// = 195075 Means max delta between images (imageA - imageB) in RGB channels
// (255^2 * 3)
static constexpr int MAX_RGB_DIST_SQ{255 * 255 * 3};
static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB{0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB{1};

inline double gaussian(double x, double sigma) {
  return std::exp(-(x * x) / (2.0 * sigma * sigma));
}

/*
The Bilateral Filter applies a composite weight based on both spatial distance
and radiometric difference (intensity) to return an image that is smoothed while
preserving edges. It reduces noise in flat regions while preserving edges by
assigning near-zero weight to pixels across high-contrast boundaries.

Parameters:
- image: Pointer to RGBA pixel buffer
- width, height: Image dimensions (px)
- sigma_spatial: Gaussian standard deviation for spatial proximity (spatial
decay)
- sigma_range: Gaussian standard deviation for intensity difference (radiometric
decay)
- color_space: Color space selector
  ├── 0: CIELAB
  └── 1: RGB
*/

void _process(const uint8_t *image, const std::vector<double> &cie_image,
              std::vector<uint8_t> &result,
              const std::vector<double> &spatial_weights,
              const std::vector<double> &range_lut, int radius,
              double sigma_range, int start_row, int end_row, size_t height,
              size_t width, uint8_t color_space) {
  int h{static_cast<int>(height)};
  int w{static_cast<int>(width)};
  const int kernel_diameter{2 * radius + 1};

  for (int y{start_row}; y < end_row; ++y) {
    for (int x{0}; x < w; ++x) {
      size_t center_idx{(y * width + x) * 4};

      uint8_t r0{image[center_idx]};
      uint8_t g0{image[center_idx + 1]};
      uint8_t b0{image[center_idx + 2]};
      uint8_t a0{image[center_idx + 3]};

      // ========= CIELAB-only section start =========
      double L0, A0, B0;
      if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        L0 = cie_image[center_idx];
        A0 = cie_image[center_idx + 1];
        B0 = cie_image[center_idx + 2];
      }
      // ========= CIELAB-only section end =========

      // in RGB mode represents r,g,b accumulators
      // in CIELAB mode represents L,A,B accumulators
      double weight_acc_channel_0{0.0}, weight_acc_channel_1{0.0},
          weight_acc_channel_2{0.0};

      double weight_acc{0.0};
      double w_space, w_range;
      double dL, dA, dB, dist;

      for (int ky{-radius}; ky <= radius; ++ky) {
        int ny{std::clamp(y + ky, 0, h - 1)};

        for (int kx{-radius}; kx <= radius; ++kx) {
          int nx{std::clamp(x + kx, 0, w - 1)};

          size_t neighbor_idx{(ny * width + nx) * 4};

          uint8_t r{image[neighbor_idx]};
          uint8_t g{image[neighbor_idx + 1]};
          uint8_t b{image[neighbor_idx + 2]};

          double L{cie_image[neighbor_idx]};
          double A{cie_image[neighbor_idx + 1]};
          double B{cie_image[neighbor_idx + 2]};

          w_space =
              spatial_weights[(ky + radius) * kernel_diameter + (kx + radius)];

          switch (color_space) {
          case COLOR_SPACE_OPTION_RGB: {
            const int dr{static_cast<int>(r) - r0};
            const int dg{static_cast<int>(g) - g0};
            const int db{static_cast<int>(b) - b0};
            const int dist_sq{dr * dr + dg * dg + db * db};
            w_range = range_lut[dist_sq];

            weight_acc_channel_0 += r * w_space * w_range;
            weight_acc_channel_1 += g * w_space * w_range;
            weight_acc_channel_2 += b * w_space * w_range;
            break;
          }
          case COLOR_SPACE_OPTION_CIELAB: {
            dL = L - L0;
            dA = A - A0;
            dB = B - B0;

            dist = std::sqrt(dL * dL + dA * dA + dB * dB);
            w_range = gaussian(dist, sigma_range);

            weight_acc_channel_0 += L * w_space * w_range;
            weight_acc_channel_1 += A * w_space * w_range;
            weight_acc_channel_2 += B * w_space * w_range;
            break;
          }
          }

          weight_acc += w_space * w_range;
        }
      }

      switch (color_space) {
      case COLOR_SPACE_OPTION_RGB: {
        result[center_idx] = static_cast<uint8_t>(
            std::clamp(weight_acc_channel_0 / weight_acc, 0.0, 255.0));
        result[center_idx + 1] = static_cast<uint8_t>(
            std::clamp(weight_acc_channel_1 / weight_acc, 0.0, 255.0));
        result[center_idx + 2] = static_cast<uint8_t>(
            std::clamp(weight_acc_channel_2 / weight_acc, 0.0, 255.0));
        result[center_idx + 3] = a0;
        break;
      }
      case COLOR_SPACE_OPTION_CIELAB: {
        double L{weight_acc_channel_0 / weight_acc};
        double A{weight_acc_channel_1 / weight_acc};
        double B{weight_acc_channel_2 / weight_acc};
        uint8_t r, g, b;
        lab_to_rgb<double, uint8_t>(L, A, B, r, g, b);
        result[center_idx] = r;
        result[center_idx + 1] = g;
        result[center_idx + 2] = b;
        result[center_idx + 3] = a0;
        break;
      }
      }
    }
  }
}

namespace img2num {
void bilateral_filter(uint8_t *image, size_t width, size_t height,
                      double sigma_spatial, double sigma_range,
                      uint8_t color_space) {
  // bad data -> return
  if (sigma_spatial <= 0.0 || sigma_range <= 0.0 || width <= 0 || height <= 0)
    return;
  if (color_space != COLOR_SPACE_OPTION_CIELAB &&
      color_space != COLOR_SPACE_OPTION_RGB)
    return;

  const int raw_radius{
      static_cast<int>(std::ceil(SIGMA_RADIUS_FACTOR * sigma_spatial))};
  const int radius{std::min(raw_radius, MAX_KERNEL_RADIUS)};
  const int kernel_diameter{2 * radius + 1};

  std::vector<uint8_t> result(width * height * 4);

  std::vector<double> spatial_weights(kernel_diameter * kernel_diameter);

  // Precompute Spatial Weights (Gaussian Kernel)
  for (int ky{-radius}; ky <= radius; ++ky) {
    for (int kx{-radius}; kx <= radius; ++kx) {
      const double dist{static_cast<double>(std::sqrt(kx * kx + ky * ky))};
      spatial_weights[(ky + radius) * kernel_diameter + (kx + radius)] =
          gaussian(dist, sigma_spatial);
    }
  }

  // ========= RGB-only section start =========
  // Precompute Range Weights
  std::vector<double> range_lut;
  if (color_space == COLOR_SPACE_OPTION_RGB) {
    range_lut.resize(MAX_RGB_DIST_SQ + 1);
    for (int i{0}; i <= MAX_RGB_DIST_SQ; ++i) {
      range_lut[i] = gaussian(static_cast<double>(std::sqrt(i)), sigma_range);
    }
  }
  // ========= RGB-only section end =========

  // ========= CIELAB section start =========
  // Compute full image RGB - CIELAB conversion
  std::vector<double> cie_image;
  if (color_space == COLOR_SPACE_OPTION_CIELAB) {
    cie_image.resize(width * height * 4);

    for (int y{0}; y < height; y++) {
      for (int x{0}; x < width; x++) {
        int center_idx{(y * static_cast<int>(width) + x) * 4};
        uint8_t r0{image[center_idx]};
        uint8_t g0{image[center_idx + 1]};
        uint8_t b0{image[center_idx + 2]};
        uint8_t a0{image[center_idx + 3]};
        double L0, A0, B0;
        rgb_to_lab<uint8_t, double>(r0, g0, b0, L0, A0, B0);

        cie_image[center_idx] = L0;
        cie_image[center_idx + 1] = A0;
        cie_image[center_idx + 2] = B0;
        cie_image[center_idx + 3] =
            0.0; // unused but keep for indexing purposes
      }
    }
  }
  // ========= CIELAB section end =========

  _process(image, cie_image, result, spatial_weights, range_lut, radius,
           sigma_range, 0, static_cast<int>(height), height, width,
           color_space);

  std::memcpy(image, result.data(), result.size());
}
}
