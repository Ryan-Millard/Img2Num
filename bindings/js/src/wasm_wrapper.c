#include <cimg2num.h>
#include <cimg2num/img2num_error_t.h>
#include <emscripten/emscripten.h>

/* ---- Error reporting -------------------------------------------------
 * Every wrapper below ends up in a C API function that catches C++
 * exceptions and records them in a thread-local "last error". A failing
 * call therefore does not trap: it returns (NULL for pointer-returning
 * functions) and the error is read back from JS with these three exports
 * (see packages/js/src/wasmError.js).
 */

/* Returns an img2num_error_t value: 0 = OK, 2 = INVALID_ARGUMENT, ... */
EMSCRIPTEN_KEEPALIVE int get_last_error(void) {
    return (int)img2num_get_last_error();
}

/* Returns a NUL-terminated message owned by the library. It is only valid
 * until the next img2num call, so read it immediately (do NOT free it). */
EMSCRIPTEN_KEEPALIVE const char* get_last_error_message(void) {
    return img2num_get_last_error_message();
}

EMSCRIPTEN_KEEPALIVE void clear_last_error(void) {
    img2num_clear_last_error();
}

EMSCRIPTEN_KEEPALIVE void
gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma) {
    img2num_gaussian_blur_fft(image, width, height, sigma);
}

EMSCRIPTEN_KEEPALIVE void invert_image(uint8_t* ptr, int width, int height) {
    img2num_invert_image(ptr, width, height);
}

EMSCRIPTEN_KEEPALIVE void
threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
    img2num_threshold_image(ptr, width, height, num_thresholds);
}

EMSCRIPTEN_KEEPALIVE void
black_threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
    img2num_black_threshold_image(ptr, width, height, num_thresholds);
}

EMSCRIPTEN_KEEPALIVE void kmeans(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space
) {
    img2num_kmeans(data, out_data, out_labels, width, height, k, max_iter, color_space);
}

EMSCRIPTEN_KEEPALIVE void bilateral_filter(
    uint8_t* image, size_t width, size_t height, double sigma_spatial, double sigma_range,
    uint8_t color_space
) {
    img2num_bilateral_filter(image, width, height, sigma_spatial, sigma_range, color_space);
}

EMSCRIPTEN_KEEPALIVE char* labels_to_svg(
    uint8_t* data, int32_t* labels, const int width, const int height, const int min_area,
    const int min_thickness
) {
    return img2num_labels_to_svg(data, labels, width, height, min_area, min_thickness);
}

EMSCRIPTEN_KEEPALIVE char* image_to_svg(
    const uint8_t* data, const int width, const int height, double sigma_spatial,
    double sigma_range, const int32_t k, const int32_t max_iter, const int min_area,
    const int min_thickness, const uint8_t color_space
) {
    img2num_ImageToSvgConfig config = img2num_ImageToSvgConfig_default();

    config.bilateral_filter.sigma_spatial = sigma_spatial;
    config.bilateral_filter.sigma_range = sigma_range;
    config.kmeans.k = k;
    config.kmeans.max_iter = max_iter;
    config.min_cluster_area = min_area;
    config.min_thickness = min_thickness;
    config.color_space = color_space;

    return img2num_image_to_svg(data, width, height, &config);
}
