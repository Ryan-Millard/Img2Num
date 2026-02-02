#include <emscripten/bind.h>
#include "image_utils.h"
#include "exported.h"

EXPORTED void gaussianBlurFft(uint8_t *image, size_t width, size_t height, double sigma) {
  gaussian_blur_fft(image, width, height, sigma);
}
