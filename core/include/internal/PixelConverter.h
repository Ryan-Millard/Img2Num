#ifndef PIXELCONVERTER_H
#define PIXELCONVERTER_H

#include <cstdint>
#include <utility>  // for std::move

namespace ImageLib {
template <typename ConverterT>

struct PixelConverter {
    ConverterT convert;
    uint8_t bytesPerPixel;

    PixelConverter(ConverterT conv, uint8_t bpp) : convert(std::move(conv)), bytesPerPixel(bpp) {
    }
};

}  // namespace ImageLib

#endif
