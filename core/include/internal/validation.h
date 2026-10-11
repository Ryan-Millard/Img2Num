#ifndef IMG2NUM_VALIDATION_H
#define IMG2NUM_VALIDATION_H

#include "img2num.h"

#include <cstddef>
#include <cstdint>

namespace img2num {

/// Smallest accepted length (in pixels) of the shortest side of an input image.
/// Anything smaller is rejected by image_to_svg() with std::invalid_argument.
inline constexpr int MIN_IMAGE_DIMENSION {16};

/// Colour space identifiers accepted in ImageToSvgConfig::color_space.
inline constexpr uint8_t COLOR_SPACE_CIELAB {0};
inline constexpr uint8_t COLOR_SPACE_SRGB {1};

/// @brief Compute width * height * 4 (the byte size of an RGBA buffer) without overflowing.
/// @param width Width in pixels.
/// @param height Height in pixels.
/// @return The number of bytes in an RGBA buffer of that size.
/// @throws std::invalid_argument if the result does not fit in size_t.
size_t checked_rgba_byte_count(size_t width, size_t height);

/// @brief Validate the arguments of image_to_svg() before any memory is allocated.
/// @details Checks, in order: non-null data, positive dimensions, minimum dimension,
///          no overflow of width * height * 4, pixel count representable as int32_t
///          (the type used by the clustering code), then the configuration values.
/// @throws std::invalid_argument with a descriptive message on the first failed check.
void validate_image_to_svg_args(
    const uint8_t* data, int width, int height, const ImageToSvgConfig& config
);

} // namespace img2num

#endif // IMG2NUM_VALIDATION_H
