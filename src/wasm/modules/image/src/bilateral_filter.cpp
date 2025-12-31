#include "image_utils.h"
#include <cmath>
#include <vector>
#include <algorithm>
#include <cstring>

static constexpr double SIGMA_RADIUS_FACTOR = 3.0; 
// Max possible squared Euclidean distance in a 3-channel 8-bit image: 255^2 * 3 = 195075
// Means max delta between images (imageA - imageB) in RGB channels (255^2 * 3)
static constexpr int MAX_RGB_DIST_SQ = 255 * 255 * 3;

/*
The Bilateral Filter applies a composite weight based on both spatial distance and radiometric difference (intensity) to return an image that is smoothed while preserving edges.
It reduces noise in flat regions while preserving edges by assigning near-zero weight to pixels across high-contrast boundaries.

Parameters:
- image: Pointer to RGBA pixel buffer
- width, height: Image dimensions (px)
- sigma_spatial: Gaussian standard deviation for spatial proximity (spatial decay)
- sigma_range: Gaussian standard deviation for intensity difference (radiometric decay)
*/
void bilateral_filter(uint8_t *image, size_t width, size_t height,
                      double sigma_spatial, double sigma_range) {
    if (sigma_spatial <= 0.0 || sigma_range <= 0.0) return;

    const int radius = static_cast<int>(std::ceil(SIGMA_RADIUS_FACTOR * sigma_spatial));
    const int kernel_width = 2 * radius + 1;
    const size_t stride = width * 4;
    std::vector<uint8_t> result(width * height * 4);

    // NOTE: precompute Spatial Weights (Gaussian Kernel)
    std::vector<double> spatial_weights(kernel_width * kernel_width);
    double two_sigma_space_sq = 2 * sigma_spatial * sigma_spatial;

    for (int ky = -radius; ky <= radius; ++ky) {
        for (int kx = -radius; kx <= radius; ++kx) {
            double dist2 = static_cast<double>(kx * kx + ky * ky);
            spatial_weights[(ky + radius) * kernel_width + (kx + radius)] = 
                std::exp(-dist2 / two_sigma_space_sq);
        }
    }

    // NOTE: precompute Range Weights
    std::vector<double> range_lut(MAX_RGB_DIST_SQ + 1);
    double two_sigma_range_sq = 2 * sigma_range * sigma_range;

    for (int i = 0; i <= MAX_RGB_DIST_SQ; ++i) {
        range_lut[i] = std::exp(-static_cast<double>(i) / two_sigma_range_sq);
    }

    int h = static_cast<int>(height);
    int w = static_cast<int>(width);

    for (int y = 0; y < h; ++y) {
        for (int x = 0; x < w; ++x) {
            size_t center_idx = (y * width + x) * 4;

            uint8_t r0 = image[center_idx];
            uint8_t g0 = image[center_idx + 1];
            uint8_t b0 = image[center_idx + 2];
            uint8_t a0 = image[center_idx + 3];

            double r_acc = 0.0, g_acc = 0.0, b_acc = 0.0, weight_acc = 0.0;

            for (int ky = -radius; ky <= radius; ++ky) {
                int ny = std::clamp(y + ky, 0, h - 1);

                for (int kx = -radius; kx <= radius; ++kx) {
                    int nx = std::clamp(x + kx, 0, w - 1);

                    size_t neighbor_idx = (ny * width + nx) * 4;

                    uint8_t r = image[neighbor_idx];
                    uint8_t g = image[neighbor_idx + 1];
                    uint8_t b = image[neighbor_idx + 2];

                    double w_space = spatial_weights[(ky + radius) * kernel_width + (kx + radius)];

                    int dr = static_cast<int>(r) - r0;
                    int dg = static_cast<int>(g) - g0;
                    int db = static_cast<int>(b) - b0;
                    int dist_sq = dr*dr + dg*dg + db*db;

                    double w_range = range_lut[dist_sq];
                    double w = w_space * w_range;

                    r_acc += r * w;
                    g_acc += g * w;
                    b_acc += b * w;
                    weight_acc += w;
                }
            }

            result[center_idx]     = static_cast<uint8_t>(std::clamp(r_acc / weight_acc, 0.0, 255.0));
            result[center_idx + 1] = static_cast<uint8_t>(std::clamp(g_acc / weight_acc, 0.0, 255.0));
            result[center_idx + 2] = static_cast<uint8_t>(std::clamp(b_acc / weight_acc, 0.0, 255.0));
            result[center_idx + 3] = a0;
        }
    }   

    std::memcpy(image, result.data(), result.size());
}
