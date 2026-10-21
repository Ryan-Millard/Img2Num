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

} // namespace ImageLib

namespace fmt {
template <typename NumberT> struct formatter<ImageLib::LABAPixel<NumberT>> {
    constexpr auto parse(format_parse_context& ctx) {
        return ctx.begin();
    }

    template <typename FormatContext>
    auto format(const ImageLib::LABAPixel<NumberT>& pixel, FormatContext& ctx) const {
        const NumberT l = pixel.l;
        const NumberT a = pixel.a;
        const NumberT b = pixel.b;
        const NumberT alpha = pixel.alpha;
        return format_to(ctx.out(), "( {},{},{},{} )", l, a, b, alpha);
    }
};
} // namespace fmt

#endif // LABAPixel_H
