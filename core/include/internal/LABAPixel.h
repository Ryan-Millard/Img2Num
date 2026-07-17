#ifndef LABAPixel_H
#define LABAPixel_H

#include "internal/LABPixel.h"

namespace ImageLib {

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
template <typename NumberT> struct LABAPixel : public ImageLib::LABPixel<NumberT> {
    // ----- Members -----
    NumberT alpha;

    // ----- Constructors -----
    constexpr LABAPixel(NumberT l = 0, NumberT a = 0, NumberT b = 0, NumberT alpha = 255)
        : LABPixel<NumberT>(l, a, b)
        , alpha(alpha) {
    }

    // ----- Modifiers -----
    [[nodiscard]] inline bool operator==(const LABAPixel& other) const {
        return LABPixel<NumberT>::operator==(other) && alpha == other.alpha;
    }
    [[nodiscard]] inline bool operator!=(const LABAPixel& other) const {
        return !(*this == other);
    }

    [[nodiscard]] inline bool operator<(const LABAPixel<NumberT>& rhs) const {
        auto this_tuple = std::make_tuple(this->l, this->a, this->b, this->alpha);
        auto rhs_tuple = std::make_tuple(rhs.l, rhs.a, rhs.b, rhs.alpha);
        return this_tuple < rhs_tuple;
    };

    [[nodiscard]] inline bool operator>(const LABAPixel<NumberT>& rhs) const {
        return rhs < *this;
    };

    // ----- Utilities -----
    inline void setGray(NumberT gray, NumberT alpha = 255) {
        LABPixel<NumberT>::setGray(gray);
        this->alpha = alpha;
    }

}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

template <typename NumberT>
std::ostream& operator<<(std::ostream& out, const ImageLib::LABAPixel<NumberT>& pixel) {
    out << "( " << pixel.l << "," << pixel.a << "," << pixel.b << "," << pixel.alpha << " )";
    return out;
}

} // namespace ImageLib

#endif // LABAPixel_H
