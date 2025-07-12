#ifndef PIXELCONVERTERS_H
#define PIXELCONVERTERS_H

#include "Pixel.h"
#include "PixelConverter.h"

namespace ImageLib {

	inline RGBPixel convertRGB(const uint8_t* p) {
		return RGBPixel{p[0], p[1], p[2]};
	}

	inline RGBAPixel convertRGBA(const uint8_t* p) {
		return RGBAPixel{p[0], p[1], p[2], p[3]};
	}

	inline const PixelConverter<RGBPixel (*)(const uint8_t*)> RGB_CONVERTER { convertRGB,  3 }; // 3 bytes per pixel
	inline const PixelConverter<RGBAPixel(*)(const uint8_t*)> RGBA_CONVERTER{ convertRGBA, 4 }; // 4 bytes per pixel

} // namespace imglib

#endif

