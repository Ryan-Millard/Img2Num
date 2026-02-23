#ifndef RGBAPIXEL_H
#define RGBAPIXEL_H

#include "internal/RGBPixel.h"

namespace ImageLib {
template <typename NumberT>
struct RGBAPixel : public ImageLib::RGBPixel<NumberT> {
    // ----- Members -----
    NumberT alpha;

    // ----- Constructors -----
    constexpr RGBAPixel(NumberT red = 0, NumberT green = 0, NumberT blue = 0, NumberT alpha = 255)
        : RGBPixel<NumberT>(red, green, blue), alpha(alpha) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const RGBAPixel &other) const {
        return RGBPixel<NumberT>::operator==(other) && alpha == other.alpha;
    }
    [[nodiscard]] inline bool operator!=(const RGBAPixel &other) const {
        return !(*this == other);
    }

    // ----- Utilities -----
    inline void setGray(NumberT gray, NumberT alpha = 255) {
        RGBPixel<NumberT>::setGray(gray);
        this->alpha = alpha;
    }

} __attribute__((packed));
}  // namespace ImageLib

#endif  // RGBAPIXEL_H
