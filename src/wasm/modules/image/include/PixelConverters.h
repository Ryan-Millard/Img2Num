#ifndef PIXELCONVERTERS_H
#define PIXELCONVERTERS_H

#include "Pixel.h"
#include "PixelConverter.h"
#include "RGBAPixel.h"
#include "RGBPixel.h"

namespace ImageLib {
template <typename NumberT>
inline RGBPixel<NumberT> convertRGB(const uint8_t *p) {
  return RGBPixel<NumberT>{static_cast<NumberT>(p[0]),
                           static_cast<NumberT>(p[1]),
                           static_cast<NumberT>(p[2])};
}

template <typename NumberT>
inline RGBAPixel<NumberT> convertRGBA(const uint8_t *p) {
  return RGBAPixel<NumberT>{
      static_cast<NumberT>(p[0]), static_cast<NumberT>(p[1]),
      static_cast<NumberT>(p[2]), static_cast<NumberT>(p[3])};
}

template <typename NumberT>
inline const PixelConverter<RGBPixel<NumberT> (*)(const uint8_t *)>
    RGB_CONVERTER{convertRGB, 3}; // 3 bytes per pixel
template <typename NumberT>
inline const PixelConverter<RGBAPixel<NumberT> (*)(const uint8_t *)>
    RGBA_CONVERTER{convertRGBA, 4}; // 4 bytes per pixel

} // namespace ImageLib

#endif
