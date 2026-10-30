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

uint8_t quantize(uint8_t value, int num_thresholds) {
    const int n = num_thresholds; // Expected range [1 : 256].

    const int bucket = value * n / 256; // Range [0 : n - 1], exactly n buckets.

    // Smallest and largest values that fall in this bucket.
    const int lo = (bucket * 256 + n - 1) / n;
    const int hi = ((bucket + 1) * 256 + n - 1) / n - 1;

    // Map to the bucket's midpoint (rounded down), which always lies inside it.
    return static_cast<uint8_t>((lo + hi) / 2);
}

namespace img2num {
// image: pointer to RGBA data
// width, height: dimensions
// sigma: standard deviation of Gaussian blur
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma_pixels) {
    if (!image || width == 0 || height == 0 || sigma_pixels <= 0)
        return;

    const size_t Npix = width * height;

    // Compute padded dimensions (next power of two)
    const size_t W = fft::next_power_of_two(width);
    const size_t H = fft::next_power_of_two(height);
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

        // Copy original image channel into padded buffer
        for (size_t y = 0; y < height; y++)
            for (size_t x = 0; x < width; x++)
                data[y * W + x] = fft::cd(image[(y * width + x) * 4 + channel], 0.0);

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

        // Copy back only the original width/height and clamp
        for (size_t y = 0; y < height; y++)
            for (size_t x = 0; x < width; x++) {
                double v = data[y * W + x].real();
                v = std::clamp(v, 0.0, 255.0);
                image[(y * width + x) * 4 + channel] = static_cast<uint8_t>(std::lrint(v));
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
    const int n = std::min(num_thresholds, 256); // More than 256 levels cannot exist.

    ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
    img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

    const auto imgWidth {img.getWidth()}, imgHeight {img.getHeight()};
    for (ImageLib::RGBAPixel<uint8_t>& p : img) {
        p.red = quantize(p.red, n);
        p.green = quantize(p.green, n);
        p.blue = quantize(p.blue, n);
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
