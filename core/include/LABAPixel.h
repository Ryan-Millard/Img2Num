#ifndef LABAPixel_H
#define LABAPixel_H

#include "LABPixel.h"

namespace ImageLib {
template <typename NumberT>
struct LABAPixel : public ImageLib::LABPixel<NumberT> {
  // ----- Members -----
  NumberT alpha;

  // ----- Constructors -----
  constexpr LABAPixel(NumberT l = 0, NumberT a = 0, NumberT b = 0,
                      NumberT alpha = 255)
      : LABPixel<NumberT>(l, a, b), alpha(alpha) {}

  // ----- Modifiers -----
  [[nodiscard]] inline bool operator==(const LABAPixel &other) const {
    return LABPixel<NumberT>::operator==(other) && alpha == other.alpha;
  }
  [[nodiscard]] inline bool operator!=(const LABAPixel &other) const {
    return !(*this == other);
  }

  // ----- Utilities -----
  inline void setGray(NumberT gray, NumberT alpha = 255) {
    LABPixel<NumberT>::setGray(gray);
    this->alpha = alpha;
  }

} __attribute__((packed));
} // namespace ImageLib

#endif // LABAPixel_H
