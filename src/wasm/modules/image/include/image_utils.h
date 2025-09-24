#ifndef IMAGE_UTILS_H
#define IMAGE_UTILS_H

#include "exported.h" // EXPORTED macro

#include <stdint.h>
#include <iostream>

#include "Image.h"
#include "RGBAPixel.h"
#include "PixelConverters.h"

uint8_t quantize(uint8_t value, uint8_t region_size);

EXPORTED void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma);
EXPORTED void invert_image(uint8_t* ptr, int width, int height);

EXPORTED void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);
EXPORTED void black_threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);

#endif
