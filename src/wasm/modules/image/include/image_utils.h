#ifndef IMAGE_UTILS_H
#define IMAGE_UTILS_H

#include <emscripten/emscripten.h>
#include <stdint.h>
#include <iostream>

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
	void invert_image(uint8_t* ptr, int width, int height);
}

#endif
