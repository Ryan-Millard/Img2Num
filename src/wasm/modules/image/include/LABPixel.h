#ifndef LABPIXEL_H
#define LABPIXEL_H

#include "Pixel.h"

/*
can support signed data types
preferrably float or double
*/

namespace ImageLib {
template <typename NumberT> struct LABPixel : public Pixel<NumberT> {
  // ----- Members -----
  NumberT l, a, b;

  constexpr LABPixel(NumberT l = 0, NumberT a = 0, NumberT b = 0)
      : l(l), a(a), b(b) {}

  // ----- Modifiers -----
  [[nodiscard]] inline bool operator==(const LABPixel &other) const {
    return l == other.l && a == other.a && b == other.b;
  }
  [[nodiscard]] inline bool operator!=(const LABPixel &other) const {
    return !(*this == other);
  }

  // ----- Utilities -----
  inline void setGray(NumberT gray) { a = b = static_cast<NumberT>(0); }
} __attribute__((packed));
} // namespace ImageLib

#endif // LABPIXEL_H
