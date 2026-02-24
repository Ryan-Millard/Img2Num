#ifndef RGBPIXEL_H
#define RGBPIXEL_H

#include <cmath>

#include "internal/Pixel.h"

namespace ImageLib {
template <typename NumberT>
struct RGBPixel : public Pixel<NumberT> {
    // ----- Members -----
    NumberT red, green, blue;

    constexpr RGBPixel(NumberT red = 0, NumberT green = 0, NumberT blue = 0)
        : red(red), green(green), blue(blue) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const RGBPixel &other) const {
        return red == other.red && green == other.green && blue == other.blue;
    }
    [[nodiscard]] inline bool operator!=(const RGBPixel &other) const {
        return !(*this == other);
    }

    // ----- Utilities -----
    inline void setGray(NumberT gray) {
        red = green = blue = gray;
    }

    static inline float colorDistance(const RGBPixel<NumberT> &a, const RGBPixel<NumberT> &b) {
        RGBPixel<float> af{static_cast<float>(a.red), static_cast<float>(a.green),
                           static_cast<float>(a.blue)};
        RGBPixel<float> bf{static_cast<float>(b.red), static_cast<float>(b.green),
                           static_cast<float>(b.blue)};
        return std::sqrt((af.red - bf.red) * (af.red - bf.red) +
                         (af.green - bf.green) * (af.green - bf.green) +
                         (af.blue - bf.blue) * (af.blue - bf.blue));
    }

} __attribute__((packed));
}  // namespace ImageLib

#endif  // RGBPIXEL_H
