#include "cimg2num.h"

#include "img2num.h"
#include "img2num/Error.h"

#include <cstring>

extern "C" {

static img2num::ImageToSvgConfig to_cpp(const img2num_ImageToSvgConfig& c) {
    // clang-format off
    return {
        .bilateral_filter {
            .sigma_spatial = c.bilateral_filter.sigma_spatial,
            .sigma_range = c.bilateral_filter.sigma_range
        },

        .kmeans {
            .k = c.kmeans.k,
            .max_iter = c.kmeans.max_iter
        },

        .min_cluster_area = c.min_cluster_area,
        .min_thickness = c.min_thickness,
        .color_space = c.color_space
    };
    // clang-format on
}

static img2num_ImageToSvgConfig to_c(const img2num::ImageToSvgConfig& cpp) {
    // clang-format off
    return {
        .bilateral_filter {
            .sigma_spatial = cpp.bilateral_filter.sigma_spatial,
            .sigma_range = cpp.bilateral_filter.sigma_range
        },
        .kmeans{
            .k = cpp.kmeans.k,
            .max_iter = cpp.kmeans.max_iter
        },
        .min_cluster_area = cpp.min_cluster_area,
        .min_thickness = cpp.min_thickness,
        .color_space = cpp.color_space
    };
    // clang-format on
}

img2num_ImageToSvgConfig img2num_ImageToSvgConfig_default(void) {
    // Use the defaults from the C++ struct
    return to_c(img2num::ImageToSvgConfig {});
}

void img2num_gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma) {
    img2num::clear_last_error_and_catch(img2num::gaussian_blur_fft, image, width, height, sigma);
}

void img2num_invert_image(uint8_t* image, int width, int height) {
    img2num::clear_last_error_and_catch(img2num::invert_image, image, width, height);
}

void img2num_threshold_image(
    uint8_t* ptr, const int width, const int height, const int num_thresholds
) {
    img2num::clear_last_error_and_catch(
        img2num::threshold_image, ptr, width, height, num_thresholds
    );
}

void img2num_black_threshold_image(
    uint8_t* ptr, const int width, const int height, const int num_thresholds
) {
    img2num::clear_last_error_and_catch(
        img2num::black_threshold_image, ptr, width, height, num_thresholds
    );
}

void img2num_kmeans(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space
) {
    img2num::clear_last_error_and_catch(
        img2num::kmeans, data, out_data, out_labels, width, height, k, max_iter, color_space
    );
}

void img2num_bilateral_filter(
    uint8_t* image, size_t width, size_t height, double sigma_spatial, double sigma_range,
    uint8_t color_space
) {
    img2num::clear_last_error_and_catch(
        img2num::bilateral_filter, image, width, height, sigma_spatial, sigma_range, color_space
    );
}

char* img2num_labels_to_svg(
    const uint8_t* data, const int32_t* labels, const int width, const int height,
    const int min_area, const int min_thickness
) {
    char* result {nullptr};
    img2num::clear_last_error_and_catch(
        [&](const uint8_t* d, const int32_t* l, const int w, const int h, const int min_a,
            const int min_t) {
            std::string svg {img2num::labels_to_svg(d, l, w, h, min_a, min_t)};
            result = static_cast<char*>(std::malloc(svg.size() + 1));
            if (!result) {
                return; // Allocation failed
            }
            std::memcpy(result, svg.c_str(), svg.size() + 1);
        },
        data, labels, width, height, min_area, min_thickness
    );
    return result;
}

char* img2num_image_to_svg(
    const uint8_t* data, const int width, const int height, const img2num_ImageToSvgConfig* config
) {
    img2num_ImageToSvgConfig default_cfg {img2num_ImageToSvgConfig_default()};

    const img2num_ImageToSvgConfig& cfg {config ? *config : default_cfg};

    char* result {nullptr};

    img2num::clear_last_error_and_catch(
        [&](const uint8_t* d, const int w, const int h) {
            std::string svg {img2num::image_to_svg(d, w, h, to_cpp(cfg))};

            result = static_cast<char*>(std::malloc(svg.size() + 1));
            if (!result) {
                return; // Allocation failed
            }
            std::memcpy(result, svg.c_str(), svg.size() + 1);
        },
        data, width, height);

    return result;
}
}
