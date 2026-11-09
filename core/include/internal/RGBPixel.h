#ifndef RGBPIXEL_H
#define RGBPIXEL_H

#include "internal/Pixel.h"

#include <cmath>
#include <cmath>
#include <spdlog/fmt/fmt.h>

namespace ImageLib {

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
template <typename NumberT> struct RGBPixel : public Pixel<NumberT> {
    // ----- Members -----
    NumberT red, green, blue;

    constexpr RGBPixel(NumberT red = 0, NumberT green = 0, NumberT blue = 0)
        : red(red)
        , green(green)
        , blue(blue) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const RGBPixel& other) const {
        return red == other.red && green == other.green && blue == other.blue;
    }
    [[nodiscard]] inline bool operator!=(const RGBPixel& other) const {
        return !(*this == other);
    }

    // ----- Utilities -----
    inline void setGray(NumberT gray) {
        red = green = blue = gray;
    }

    static inline float colorDistance(const RGBPixel<NumberT>& a, const RGBPixel<NumberT>& b) {
        RGBPixel<float> af {
            static_cast<float>(a.red), static_cast<float>(a.green), static_cast<float>(a.blue)
        };
        RGBPixel<float> bf {
            static_cast<float>(b.red), static_cast<float>(b.green), static_cast<float>(b.blue)
        };
        return std::sqrt(
            (af.red - bf.red) * (af.red - bf.red) + (af.green - bf.green) * (af.green - bf.green) +
            (af.blue - bf.blue) * (af.blue - bf.blue)
        );
    }

}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

} // namespace ImageLib


namespace fmt {
template <typename NumberT> struct formatter<ImageLib::RGBPixel<NumberT>> {
    constexpr auto parse(format_parse_context& ctx) {
        return ctx.begin();
    }

    template <typename FormatContext>
    auto format(const ImageLib::RGBPixel<NumberT>& pixel, FormatContext& ctx) const {
        // The struct is packed, so copy the members out instead of
        // binding references to them.
        const NumberT red = pixel.red;
        const NumberT green = pixel.green;
        const NumberT blue = pixel.blue;
        return format_to(ctx.out(), "( {},{},{} )", red, green, blue);
    }
};
} // namespace fmt

#endif // RGBPIXEL_H
