#ifndef RGBPIXEL_H
#define RGBPIXEL_H

#include "Pixel.h"

namespace ImageLib {
	struct RGBPixel : public ImageLib::Pixel {
		// ----- Members -----
		uint8_t red, green, blue;

		constexpr RGBPixel(uint8_t red = 0, uint8_t green = 0, uint8_t blue = 0)
			: red(red), green(green), blue(blue) {}

		// ----- Modifiers -----
		[[nodiscard]] inline bool operator==(const RGBPixel& other) const {
			return red == other.red && green == other.green && blue == other.blue;
		}
		[[nodiscard]] inline bool operator!=(const RGBPixel& other) const {
			return !(*this == other);
		}

		// ----- Utilities -----
		inline void setGray(uint8_t gray) {
			red = green = blue = gray;
		}
	};
}

#endif // RGBPIXEL_H
