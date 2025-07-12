#ifndef RGBAPIXEL_H
#define RGBAPIXEL_H

#include "RGBPixel.h"

namespace ImageLib {
	struct RGBAPixel : public ImageLib::RGBPixel {
		// ----- Members -----
		uint8_t alpha;

		// ----- Constructors -----
		constexpr RGBAPixel(uint8_t red = 0, uint8_t green = 0, uint8_t blue = 0, uint8_t alpha = 255)
			: RGBPixel(red, green, blue), alpha(alpha) {}

		// ----- Modifiers -----
		[[nodiscard]] inline bool operator==(const RGBAPixel& other) const {
			return RGBPixel::operator==(other) && alpha == other.alpha;
		}
		[[nodiscard]] inline bool operator!=(const RGBAPixel& other) const {
			return !(*this == other);
		}

		// ----- Utilities -----
		inline void setGray(uint8_t gray, uint8_t alpha) {
			RGBPixel::setGray(gray);
			this->alpha = alpha;
		}

	} __attribute__((packed));
}

#endif // RGBAPIXEL_H
