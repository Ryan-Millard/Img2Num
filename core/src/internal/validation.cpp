#include "validation.h"

#include <cmath>
#include <limits>
#include <stdexcept>
#include <string>

namespace img2num {

size_t checked_rgba_byte_count(size_t width, size_t height) {
    constexpr size_t max_size {std::numeric_limits<size_t>::max()};

    if (width != 0 && height > max_size / width) {
        throw std::invalid_argument(
            "image_to_svg: image is too large: width * height overflows (" + std::to_string(width) +
            " x " + std::to_string(height) + ")"
        );
    }
    const size_t pixel_count {width * height};

    if (pixel_count > max_size / 4) {
        throw std::invalid_argument(
            "image_to_svg: image is too large: width * height * 4 overflows (" +
            std::to_string(width) + " x " + std::to_string(height) + ")"
        );
    }
    return pixel_count * 4;
}

void validate_image_to_svg_args(
    const uint8_t* data, const int width, const int height, const ImageToSvgConfig& config
) {
    // ---- Input image ----
    if (data == nullptr) {
        throw std::invalid_argument("image_to_svg: pixel data must not be null");
    }
    if (width <= 0 || height <= 0) {
        throw std::invalid_argument(
            "image_to_svg: width and height must be positive (got " + std::to_string(width) +
            " x " + std::to_string(height) + ")"
        );
    }
    if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
        throw std::invalid_argument(
            "image_to_svg: image is too small: the shortest side must be at least " +
            std::to_string(MIN_IMAGE_DIMENSION) + " pixels (got " + std::to_string(width) + " x " +
            std::to_string(height) + ")"
        );
    }

    // Throws if width * height * 4 overflows size_t (realistic on 32-bit targets such as WASM).
    const size_t w {static_cast<size_t>(width)};
    const size_t h {static_cast<size_t>(height)};
    (void)checked_rgba_byte_count(w, h);

    // The clustering code indexes pixels with int32_t.
    const size_t pixel_count {w * h};
    if (pixel_count > static_cast<size_t>(std::numeric_limits<int32_t>::max())) {
        throw std::invalid_argument(
            "image_to_svg: image is too large: " + std::to_string(width) + " x " +
            std::to_string(height) + " has more pixels than the supported maximum of " +
            std::to_string(std::numeric_limits<int32_t>::max())
        );
    }

    // ---- Configuration ----
    const double sigma_spatial {config.bilateral_filter.sigma_spatial};
    const double sigma_range {config.bilateral_filter.sigma_range};
    // `!(x > 0)` also rejects NaN; isfinite rejects +inf.
    if (!(sigma_spatial > 0.0) || !std::isfinite(sigma_spatial)) {
        throw std::invalid_argument(
            "image_to_svg: bilateral_filter.sigma_spatial must be a finite number > 0 (got " +
            std::to_string(sigma_spatial) + ")"
        );
    }
    if (!(sigma_range > 0.0) || !std::isfinite(sigma_range)) {
        throw std::invalid_argument(
            "image_to_svg: bilateral_filter.sigma_range must be a finite number > 0 (got " +
            std::to_string(sigma_range) + ")"
        );
    }

    if (config.kmeans.k < 1) {
        throw std::invalid_argument(
            "image_to_svg: kmeans.k must be >= 1 (got " + std::to_string(config.kmeans.k) + ")"
        );
    }
    if (static_cast<size_t>(config.kmeans.k) > pixel_count) {
        throw std::invalid_argument(
            "image_to_svg: kmeans.k (" + std::to_string(config.kmeans.k) +
            ") must not exceed the number of pixels (" + std::to_string(pixel_count) + ")"
        );
    }
    if (config.kmeans.max_iter < 1) {
        throw std::invalid_argument(
            "image_to_svg: kmeans.max_iter must be >= 1 (got " +
            std::to_string(config.kmeans.max_iter) + ")"
        );
    }

    if (config.min_cluster_area < 0) {
        throw std::invalid_argument(
            "image_to_svg: min_cluster_area must be >= 0 (got " +
            std::to_string(config.min_cluster_area) + ")"
        );
    }
    if (config.min_thickness < 0) {
        throw std::invalid_argument(
            "image_to_svg: min_thickness must be >= 0 (got " +
            std::to_string(config.min_thickness) + ")"
        );
    }

    if (config.color_space != COLOR_SPACE_CIELAB && config.color_space != COLOR_SPACE_SRGB) {
        throw std::invalid_argument(
            "image_to_svg: color_space must be 0 (CIE LAB) or 1 (sRGB) (got " +
            std::to_string(static_cast<int>(config.color_space)) + ")"
        );
    }
}

} // namespace img2num
