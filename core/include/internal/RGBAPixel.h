#ifndef RGBAPIXEL_H
#define RGBAPIXEL_H

#include "internal/RGBPixel.h"

namespace ImageLib {

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
template <typename NumberT> struct RGBAPixel : public ImageLib::RGBPixel<NumberT> {
    // ----- Members -----
    NumberT alpha;

    // ----- Constructors -----
    constexpr RGBAPixel(NumberT red = 0, NumberT green = 0, NumberT blue = 0, NumberT alpha = 255)
        : RGBPixel<NumberT>(red, green, blue)
        , alpha(alpha) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const RGBAPixel& other) const {
        return RGBPixel<NumberT>::operator==(other) && alpha == other.alpha;
    }
    [[nodiscard]] inline bool operator!=(const RGBAPixel& other) const {
        return !(*this == other);
    }

    // ----- Utilities -----
    inline void setGray(NumberT gray, NumberT alpha = 255) {
        RGBPixel<NumberT>::setGray(gray);
        this->alpha = alpha;
    }

    [[nodiscard]] inline bool operator<(const RGBAPixel<NumberT>& rhs) const {
        auto this_tuple = std::make_tuple(this->red, this->green, this->blue, this->alpha);
        auto rhs_tuple = std::make_tuple(rhs.red, rhs.green, rhs.blue, rhs.alpha);
        return this_tuple < rhs_tuple;
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
std::ostream& operator<<(std::ostream& out, const ImageLib::RGBAPixel<NumberT>& pixel) {
    out << "( " << pixel.red << "," << pixel.green << "," << pixel.blue << "," << pixel.alpha
        << " )";
    return out;
}

} // namespace ImageLib

#endif // RGBAPIXEL_H
