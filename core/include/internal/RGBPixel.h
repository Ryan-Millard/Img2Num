#ifndef RGBPIXEL_H
#define RGBPIXEL_H

#include "internal/Pixel.h"

#include <cmath>
#include <iostream>

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
            static_cast<float>(a.red), static_cast<float>(a.green), static_cast<float>(a.blue)};
        RGBPixel<float> bf {
            static_cast<float>(b.red), static_cast<float>(b.green), static_cast<float>(b.blue)};
        return std::sqrt(
            (af.red - bf.red) * (af.red - bf.red) + (af.green - bf.green) * (af.green - bf.green) +
            (af.blue - bf.blue) * (af.blue - bf.blue)
        );
    }

    [[nodiscard]] inline bool operator<(const RGBPixel<NumberT>& rhs) const {
        auto this_tuple = std::make_tuple(this->red, this->green, this->blue);
        auto rhs_tuple = std::make_tuple(rhs.red, rhs.green, rhs.blue);
        return this_tuple < rhs_tuple;
    };

    [[nodiscard]] inline bool operator>(const RGBPixel<NumberT>& rhs) const {
        return rhs < *this;
    };

}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

template <typename NumberT>
std::ostream& operator<<(std::ostream& out, const ImageLib::RGBPixel<NumberT>& pixel) {
    out << "( " << pixel.red << "," << pixel.green << "," << pixel.blue << " )";
    return out;
}

} // namespace ImageLib

#endif // RGBPIXEL_H
