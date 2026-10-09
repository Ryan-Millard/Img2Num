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

/**
 * Mirrors an out-of-range coordinate back into [0, dim) (reflect padding,
 * edge pixel repeated: -1 -> 0, dim -> dim - 1). Runs in O(1) using modulo.
 * Returns 0 when dim <= 1, since there is nothing to reflect.
 */
static size_t reflect_index(int p, int dim) {
    if (dim <= 1) return 0;
    const int64_t period = 2 * static_cast<int64_t>(dim); // int64: 2*dim can overflow int
    int64_t q = p % period;
    if (q < 0) q += period;
    if (q >= dim) q = period - 1 - q;
    return static_cast<size_t>(q);
}

namespace img2num {

/**
 * Applies a Gaussian blur in place using FFT on the R, G and B channels of an RGBA image.
 * The image is reflect-padded by ceil(3 * sigma_pixels) on each side before the FFT to avoid
 * border darkening and circular edge wrapping. The alpha channel is left unchanged.
 *
 * @param image        Pointer to RGBA data (4 bytes per pixel).
 * @param width        Image width in pixels.
 * @param height       Image height in pixels.
 * @param sigma_pixels Standard deviation of the Gaussian in pixels. Must be finite and > 0,
 *                     otherwise the image is left untouched.
 */
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma_pixels) {
    if (!image || width == 0 || height == 0 || !std::isfinite(sigma_pixels) || sigma_pixels <= 0)
        return;

    // Keep every dimension within 2^30 so the int casts below (reflect_index, freq_coord)
    // and next_power_of_two() cannot overflow.
    constexpr size_t kMaxDim = size_t(1) << 30;
    if (width > kMaxDim || height > kMaxDim)
        return;

    // Pad by at least 3*sigma pixels to avoid border darkening and edge wrapping.
    // Check in double BEFORE casting: converting an out-of-range double to size_t is UB.
    const double pad_d = std::ceil(3.0 * sigma_pixels);
    if (pad_d > static_cast<double>(kMaxDim))
        return;
    const size_t pad = static_cast<size_t>(pad_d);

    // Ensure width + 2*pad and height + 2*pad stay <= kMaxDim (written to avoid overflow)
    if (pad > (kMaxDim - width) / 2 || pad > (kMaxDim - height) / 2)
        return;
    const size_t padded_width = width + 2 * pad;
    const size_t padded_height = height + 2 * pad;

    // Compute padded dimensions (next power of two); both are <= kMaxDim
    const size_t W = fft::next_power_of_two(padded_width);
    const size_t H = fft::next_power_of_two(padded_height);

    // Cap total FFT buffer size to prevent memory exhaustion (DoS) from a huge sigma.
    // This also covers the W * H overflow case, so no separate overflow check is needed.
    constexpr size_t MAX_FFT_ELEMENTS = 64 * 1024 * 1024; // 64M elements limit
    if (W > MAX_FFT_ELEMENTS / H)
        return;
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

// Unlike `threshold_image` above, `num_thresholds` here is a per-channel 0-255
// brightness cutoff, not a number of output levels. A pixel becomes pure black
// only when all three of its channels are strictly below the cutoff.
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