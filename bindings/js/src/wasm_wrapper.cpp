#include <emscripten/emscripten.h>
#include <img2num.h>

extern "C" {
  EMSCRIPTEN_KEEPALIVE void gaussian_blur_fft(uint8_t *image, size_t width, size_t height, double sigma) {
    img2num::gaussian_blur_fft(image, width, height, sigma);
  }

  EMSCRIPTEN_KEEPALIVE void invert_image(uint8_t *ptr, int width, int height) {
    img2num::invert_image(ptr, width, height);
  }

  EMSCRIPTEN_KEEPALIVE void threshold_image(uint8_t *ptr, const int width, const int height, const int num_thresholds) {
    img2num::threshold_image(ptr, width, height, num_thresholds);
  }

  EMSCRIPTEN_KEEPALIVE void black_threshold_image(uint8_t *ptr, const int width, const int height, const int num_thresholds) {
    img2num::black_threshold_image(ptr, width, height, num_thresholds);
  }

  EMSCRIPTEN_KEEPALIVE void kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels, const int32_t width, const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space) {
    img2num::kmeans(data, out_data, out_labels, width, height, k, max_iter, color_space);
  }

  EMSCRIPTEN_KEEPALIVE void bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_spatial, double sigma_range, uint8_t color_space) {
    img2num::bilateral_filter(image, width, height, sigma_spatial, sigma_range, color_space);
  }

  EMSCRIPTEN_KEEPALIVE char* labels_to_svg(uint8_t *data, int32_t *labels, const int width, const int height, const int min_area, const bool draw_contour_borders) {
    return img2num::labels_to_svg(data, labels, width, height, min_area, draw_contour_borders);
  }
}
