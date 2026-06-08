#ifndef SHARED_CONTOURS_H
#define SHARED_CONTOURS_H

#include <cstdint>
#include <unordered_map>
#include <vector>

#include "internal/Point.h"
#include "internal/contours.h"  // QuadBezier

// Crack-based shared-edge contour builder.
//
// Builds region boundaries on the pixel-corner ("crack") grid rather than on
// pixel centres. The boundary between two regions is extracted ONCE as a
// canonical edge (a chain of cracks between two junction corners), simplified
// once, and then reused by BOTH adjacent regions. Neighbouring contours are
// therefore exactly coincident along every shared edge -- no overlap band and no
// gaps, by construction.
//
// `labels` is the per-pixel region id (w*h, row major); any value is treated as a
// distinct region, out-of-bounds is the image exterior. Returns, per region id,
// its list of closed boundary loops, each a sequence of quadratic beziers in
// corner coordinates (0..w, 0..h). Each shared edge is fitted ONCE and reused by
// both adjacent regions, so neighbouring loops are exactly coincident.
//
// `eps` is the curve-fit tolerance applied to each canonical edge.
std::unordered_map<int32_t, std::vector<std::vector<QuadBezier>>> build_shared_loops(
    const std::vector<int32_t> &labels, int w, int h, float eps);

#endif
