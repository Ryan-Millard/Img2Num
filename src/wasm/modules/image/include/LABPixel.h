#ifndef LABPIXEL_H
#define LABPIXEL_H

#include "Pixel.h"
#include <cmath>

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
  inline void setGray(NumberT new_luma) {
    l = new_luma;
    a = b = 0;
  }

  static inline float colorDistance(const LABPixel<NumberT> &a,
                                    const LABPixel<NumberT> &b) {

    LABPixel<float> af{static_cast<float>(a.l), static_cast<float>(a.a),
                       static_cast<float>(a.b)};
    LABPixel<float> bf{static_cast<float>(b.l), static_cast<float>(b.a),
                       static_cast<float>(b.b)};
    return std::sqrt((a.l - b.l) * (a.l - b.l) + (a.a - b.a) * (a.a - b.a) +
                     (a.b - b.b) * (a.b - b.b));
  }

} __attribute__((packed));
} // namespace ImageLib

#endif // LABPIXEL_H
