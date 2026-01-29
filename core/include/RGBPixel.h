#ifndef RGBPIXEL_H
#define RGBPIXEL_H

#include "Pixel.h"

namespace ImageLib {
template <typename NumberT> struct RGBPixel : public Pixel<NumberT> {
  // ----- Members -----
  NumberT red, green, blue;

  constexpr RGBPixel(NumberT red = 0, NumberT green = 0, NumberT blue = 0)
      : red(red), green(green), blue(blue) {}

  // ----- Modifiers -----
  [[nodiscard]] inline bool operator==(const RGBPixel &other) const {
    return red == other.red && green == other.green && blue == other.blue;
  }
  [[nodiscard]] inline bool operator!=(const RGBPixel &other) const {
    return !(*this == other);
  }

  // ----- Utilities -----
  inline void setGray(NumberT gray) { red = green = blue = gray; }
} __attribute__((packed));
} // namespace ImageLib

#endif // RGBPIXEL_H
