#ifndef SHARED_CONTOURS_H
#define SHARED_CONTOURS_H

#include <cstdint>
#include <unordered_map>
#include <vector>

#include "internal/Point.h"
#include "internal/contours.h"  // QuadBezier

/**
 * `@brief` Build crack-grid shared boundary loops for each region.
 *
 * Builds region boundaries on the pixel-corner ("crack") grid rather than on
 * pixel centres. Shared edges are extracted once, simplified once, and reused
 * by both adjacent regions so neighbouring loops stay exactly coincident.
 *
 * `@param` labels Per-pixel region ids in row-major order (`w * h` entries).
 * `@param` w Image width in pixels.
 * `@param` h Image height in pixels.
 * `@param` eps Curve-fit tolerance applied to each canonical edge.
 * `@return` Per-region closed boundary loops in corner coordinates.
 */
std::unordered_map<int32_t, std::vector<std::vector<QuadBezier>>> build_shared_loops(
    const std::vector<int32_t> &labels, int w, int h, float eps);

#endif
