#ifndef BILATERAL_FILTER_H
#define BILATERAL_FILTER_H

#include <cstddef> // for size_t
#include <cstdint> // for uint8_t

namespace bilateral {

// Apply bilateral filter to an image.
// The filter modifies the image buffer in-place.
// Parameters:
//  - image: Pointer to RGBA pixel buffer
//  - width, height: Image dimensions (px)
//  - sigma_spatial: Gaussian standard deviation for spatial proximity (spatial decay)
//  - sigma_range: Gaussian standard deviation for intensity difference (radiometric decay)
void bilateral_filter(uint8_t *image, size_t width, size_t height,
                      double sigma_spatial, double sigma_range,
                      uint8_t color_space);

} // namespace bilateral

#endif // BILATERAL_FILTER_H
