#ifndef PIXEL_H
#define PIXEL_H

#include <type_traits>

namespace ImageLib {
	template <typename NumberT>
	struct Pixel {
		static_assert(std::is_arithmetic<NumberT>::value, "RGBPixel<NumberT>: NumberT must be a numeric type");

		using value_type = NumberT;

		~Pixel() = default;
	};
}

#endif // PIXEL_H
