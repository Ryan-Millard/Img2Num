#ifndef IMAGE_UTILS_H
#define IMAGE_UTILS_H

#include <emscripten/emscripten.h>
#include <stdint.h>
#include <iostream>

#include "Image.h"
#include "RGBAPixel.h"
#include "PixelConverters.h"

uint8_t quantize(uint8_t value, uint8_t region_size);

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
	void invert_image(uint8_t* ptr, int width, int height);
	void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);
	void black_threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);
}

#endif
