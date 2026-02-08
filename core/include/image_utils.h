#ifndef IMAGE_UTILS_H
#define IMAGE_UTILS_H

#include <cstdint>

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"

uint8_t quantize(uint8_t value, uint8_t region_size);

#endif
