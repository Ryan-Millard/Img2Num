#include "cimg2num.h"
#include "cimg2num/cimg2num_error_t.h"
#include "img2num.h"  // original C++ header

extern "C" {

void img2num_gaussian_blur_fft(uint8_t *image, size_t width, size_t height, double sigma) {
    cimg2num::clear_last_error_and_catch(img2num::gaussian_blur_fft, image, width, height, sigma);
}

void img2num_invert_image(uint8_t *image, int width, int height) {
    cimg2num::clear_last_error_and_catch(img2num::invert_image, image, width, height);
}

void img2num_threshold_image(uint8_t *ptr, const int width, const int height,
                             const int num_thresholds) {
    cimg2num::clear_last_error_and_catch(img2num::threshold_image, ptr, width, height, num_thresholds);
}

void img2num_black_threshold_image(uint8_t *ptr, const int width, const int height,
                                   const int num_thresholds) {
    cimg2num::clear_last_error_and_catch(img2num::black_threshold_image, ptr, width, height, num_thresholds);
}

void img2num_kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
                    const int32_t width, const int32_t height, const int32_t k,
                    const int32_t max_iter, const uint8_t color_space) {
    cimg2num::clear_last_error_and_catch(img2num::kmeans, data, out_data, out_labels, width, height, k, max_iter, color_space);
}

void img2num_bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_spatial,
                              double sigma_range, uint8_t color_space) {
    cimg2num::clear_last_error_and_catch(img2num::bilateral_filter, image, width, height, sigma_spatial, sigma_range, color_space);
}

char* img2num_labels_to_svg(uint8_t *data, int32_t *labels, const int width, const int height,
                            const int min_area, const bool draw_contour_borders) {
    char* result{nullptr};
    cimg2num::clear_last_error_and_catch([&](uint8_t *d, int32_t *l, int w, int h, int min_a, bool draw_contours) {
        result = img2num::labels_to_svg(d, l, w, h, min_a, draw_contours);
    }, data, labels, width, height, min_area, draw_contour_borders);
    return result;
}
}
