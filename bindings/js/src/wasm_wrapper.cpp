#include <emscripten/bind.h>
#include "image_utils.h"
#include "exported.h"

EXPORTED void invertImage(uint8_t *ptr, int width, int height) {
  invert_image(ptr, width, height);
}
