#include "image_utils.h"
#include <emscripten/emscripten.h>
#include <stdint.h>
#include <iostream>

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
		void invert_image(uint8_t* ptr, int length) {
			for (int i = 0; i < length; i += 4) {
				ptr[i + 0] = 255 - ptr[i + 0]; // R
				ptr[i + 1] = 255 - ptr[i + 1]; // G
				ptr[i + 2] = 255 - ptr[i + 2]; // B
											   // ptr[i + 3] = A (leave alpha as-is)
			}
		}
}
