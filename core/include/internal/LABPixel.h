#ifndef LABPIXEL_H
#define LABPIXEL_H

#include "internal/Pixel.h"

#include <cmath>
#include <iostream>

/*
can support signed data types
preferrably float or double
*/

namespace ImageLib {

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
template <typename NumberT> struct LABPixel : public Pixel<NumberT> {
    // ----- Members -----
    NumberT l, a, b;

    constexpr LABPixel(NumberT l = 0, NumberT a = 0, NumberT b = 0)
        : l(l)
        , a(a)
        , b(b) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const LABPixel& other) const {
        return l == other.l && a == other.a && b == other.b;
    }
    [[nodiscard]] inline bool operator!=(const LABPixel& other) const {
        return !(*this == other);
    }

    // ----- Utilities -----
    inline void setGray(NumberT new_luma) {
        l = new_luma;
        a = b = 0;
    }

    static inline float colorDistance(const LABPixel<NumberT>& a, const LABPixel<NumberT>& b) {
        LABPixel<float> af {
            static_cast<float>(a.l), static_cast<float>(a.a), static_cast<float>(a.b)};
        LABPixel<float> bf {
            static_cast<float>(b.l), static_cast<float>(b.a), static_cast<float>(b.b)};
        return std::sqrt(
            (a.l - b.l) * (a.l - b.l) + (a.a - b.a) * (a.a - b.a) + (a.b - b.b) * (a.b - b.b)
        );
    }

    [[nodiscard]] inline bool operator<(const LABPixel<NumberT>& rhs) const {
        auto this_tuple = std::make_tuple(this->l, this->a, this->b);
        auto rhs_tuple = std::make_tuple(rhs.l, rhs.a, rhs.b);
        return this_tuple < rhs_tuple;
    };

    [[nodiscard]] inline bool operator>(const LABPixel<NumberT>& rhs) const {
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
std::ostream& operator<<(std::ostream& out, const ImageLib::LABPixel<NumberT>& pixel) {
    out << "( " << pixel.l << "," << pixel.a << "," << pixel.b << " )";
    return out;
}

} // namespace ImageLib

#endif // LABPIXEL_H
