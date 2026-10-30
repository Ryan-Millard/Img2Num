#ifndef IMAGE_UTILS_H
#define IMAGE_UTILS_H

#include <cstdint>

/**
 * `@brief` Map a channel value to the midpoint of its quantization bucket.
 *
 * Splits the 256 possible values into `num_thresholds` equal buckets, using
 * `bucket = value * num_thresholds / 256`, and returns the midpoint of the bucket
 * that `value` falls in (rounded down). The result always lies inside its own bucket,
 * so quantizing an already quantized value returns it unchanged.
 *
 * `@param` value Channel value to quantize (0-255).
 * `@param` num_thresholds Number of output levels; must be in the range 1..256. Zero
 * divides by zero, so callers must validate and clamp it first.
 * `@return` The representative value of the bucket containing `value`.
 */
uint8_t quantize(uint8_t value, int num_thresholds);

#endif
