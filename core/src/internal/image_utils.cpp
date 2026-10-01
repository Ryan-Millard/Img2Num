#include "internal/image_utils.h"

#include "img2num.h"
#include "internal/fft_iterative.h"
#include "internal/Image.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <limits>
#include <vector>

// M_PI is not defined by default on MSVC
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

uint8_t quantize(uint8_t value, uint8_t region_size) {
    if (region_size == 0) {
        return value;
    }

    uint8_t bucket = value / region_size; // Narrowing to colour boundary with
                                          // Range [0 : num_thresholds - 1].

    uint8_t bucket_boundary = (bucket * region_size);
    uint8_t bucket_midpoint =
        bucket_boundary + (region_size / 2); // Map to threshold region's midpoint.

    // In case of bucket_midpoint overflow: revert to a smaller bucket than the
    // largest possible value.
    bool overflow = bucket_midpoint < bucket_boundary;
    if (overflow) {
        bucket_midpoint = ((bucket - 1) * region_size) +
                          (region_size / 2); // Correction by reducing the bucket value belongs to.
    }

    return bucket_midpoint;
}

namespace img2num {

// Helper to calculate reflect (mirror) boundary index
static size_t reflect_index(int p, int dim) {
    if (dim <= 1) return 0;
    while (p < 0 || p >= dim) {
        if (p < 0) {
            p = -p - 1;
        } else if (p >= dim) {
            p = 2 * dim - 1 - p;
        }
    }
    return static_cast<size_t>(p);
}

// image: pointer to RGBA data
// width, height: dimensions
// sigma: standard deviation of Gaussian blur
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma_pixels) {
    if (!image || width == 0 || height == 0 || sigma_pixels <= 0)
        return;

    // Pad by at least 3*sigma pixels to avoid border darkening and edge wrapping
    const size_t pad = static_cast<size_t>(std::ceil(3.0 * sigma_pixels));
    const size_t padded_width = width + 2 * pad;
    const size_t padded_height = height + 2 * pad;

    // Compute padded dimensions (next power of two)
    const size_t W = fft::next_power_of_two(padded_width);
    const size_t H = fft::next_power_of_two(padded_height);
    const size_t Npix_padded = W * H;

    // Frequency coordinates helper (DC at corner)
    auto freq_coord = [](int k, int dim) -> double {
        return (k <= dim / 2) ? double(k) / dim : double(k - dim) / dim;
    };

    // Precompute Gaussian factor in frequency domain
    const double two_pi2_sigma2 = 2.0 * M_PI * M_PI * sigma_pixels * sigma_pixels;

    for (int channel = 0; channel < 3; channel++) {
        // Allocate padded buffer
        std::vector<fft::cd> data(Npix_padded, {0.0, 0.0});

        // Copy image channel with reflect padding into padded buffer
        for (size_t y = 0; y < H; y++) {
            int py = static_cast<int>(y) - static_cast<int>(pad);
            size_t src_y = reflect_index(py, static_cast<int>(height));
            for (size_t x = 0; x < W; x++) {
                int px = static_cast<int>(x) - static_cast<int>(pad);
                size_t src_x = reflect_index(px, static_cast<int>(width));
                data[y * W + x] = fft::cd(image[(src_y * width + src_x) * 4 + channel], 0.0);
            }
        }

        // Forward 2D FFT
        fft::iterative_fft_2d(data, W, H, false);

        // Apply Gaussian filter in frequency domain
        for (size_t y = 0; y < H; y++) {
            double fy2 = freq_coord(y, H) * freq_coord(y, H);
            for (size_t x = 0; x < W; x++) {
                double fx2 = freq_coord(x, W) * freq_coord(x, W);
                double gain = std::exp(-two_pi2_sigma2 * (fx2 + fy2));
                data[y * W + x] *= gain;
            }
        }

        // Inverse 2D FFT
        fft::iterative_fft_2d(data, W, H, true);

        // Copy back original width/height region from (pad, pad) and clamp
        for (size_t y = 0; y < height; y++) {
            for (size_t x = 0; x < width; x++) {
                size_t py = y + pad;
                size_t px = x + pad;
                double v = data[py * W + px].real();
                if (v < 0.0) v = 0.0;
                else if (v > 255.0) v = 255.0;
                image[(y * width + x) * 4 + channel] = static_cast<uint8_t>(std::lrint(v));
            }
        }
    }

    // Alpha channel remains unchanged
}

// Called from JS. `ptr` points to RGBA bytes.
void invert_image(uint8_t* ptr, int width, int height) {
    ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
    img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

    for (ImageLib::RGBAPixel<uint8_t>& p : img) {
        p.red = 255 - p.red;
        p.blue = 255 - p.blue;
        p.green = 255 - p.green;
    }

    const auto& modified = img.getData();
    std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}

void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
    if (num_thresholds <= 0) {
        return;
    }
    const uint8_t REGION_SIZE(255 / num_thresholds); // Size of buckets per colour

    ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
    img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

    const auto imgWidth {img.getWidth()}, imgHeight {img.getHeight()};
    for (ImageLib::RGBAPixel<uint8_t>& p : img) {
        p.red = quantize(p.red, REGION_SIZE);
        p.green = quantize(p.green, REGION_SIZE);
        p.blue = quantize(p.blue, REGION_SIZE);
    }

    const auto& modified = img.getData();
    std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}

void black_threshold_image(
    uint8_t* ptr, const int width, const int height, const int num_thresholds
) {
    if (num_thresholds <= 0) {
        return;
    }
    ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
    img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

    const auto imgWidth {img.getWidth()}, imgHeight {img.getHeight()};
    for (ImageLib::RGBAPixel<uint8_t>& p : img) {
        const bool R {p.red < num_thresholds};
        const bool G {p.green < num_thresholds};
        const bool B {p.blue < num_thresholds};
        if (R && B && G) {
            p.setGray(0);
        }
    }

    const auto& modified = img.getData();
    std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}

} // namespace img2num