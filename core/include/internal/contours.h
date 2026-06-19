#ifndef CONTOURS_H
#define CONTOURS_H

#include "internal/Image.h"
#include "internal/PixelConverters.h"
#include "internal/Point.h"
#include "internal/RGBAPixel.h"
#include "internal/SavitskyGolay.h"

#include <array>
#include <cstdint>
#include <cstdlib>
#include <stdexcept>
#include <vector>

struct QuadBezier {
    Point p0 {0, 0}; // Start
    Point p1 {0, 0}; // Control
    Point p2 {0, 0}; // End
};

struct Rect {
    float x, y, width, height;
};

struct ContoursResult {
    // contours[k] is a sequence of boundary pixels (x,y) in image coordinates
    // (0..w-1, 0..h-1)
    std::vector<std::vector<Point>> contours;
    std::vector<std::vector<QuadBezier>> curves;

    // hierarchy[k] = { next_sibling, prev_sibling, first_child, parent }
    // -1 means "none"
    std::vector<std::array<int, 4>> hierarchy;

    // is_hole[k] == true if contour k is a hole border
    std::vector<bool> is_hole;
};

struct ColoredContours : ContoursResult {
    // inherits: contours, hierarchy, is_hole

    std::vector<ImageLib::RGBAPixel<uint8_t>> colors;
};

namespace contours {
ContoursResult find_contours(const std::vector<uint8_t>& binary, int width, int height);

void stitch_smooth(std::vector<Point>& vecA, std::vector<Point>& vecB);
void coupled_smooth(std::vector<std::vector<Point>>& contours, Rect bounds);

<<<<<<< HEAD
void coupled_smooth_junctions(std::vector<std::vector<Point>> &contours, Rect bounds, std::vector<uint8_t> junctions, int width);

void pack_with_boundary_constraints(std::vector<std::vector<Point>> &contours, Rect bounds,
                                    int iterations = 15);
=======
/**
 * `@brief` Applies coupled smoothing with junction point locking.
 *
 * Similar to coupled_smooth but additionally locks points identified as junctions,
 * preventing them from moving during the smoothing process. This preserves junction
 * positions where multiple region boundaries meet.
 *
 * `@param` contours Vector of contour polylines to smooth
 * `@param` bounds Bounding rectangle defining boundary constraints
 * `@param` junctions Junction mask (image buffer with nonzero entries marking junction pixels)
 * `@param` width Image width for raster indexing into the junctions mask
 */
void coupled_smooth_junctions(
    std::vector<std::vector<Point>>& contours, Rect bounds, std::vector<uint8_t> junctions,
    int width
);

void pack_with_boundary_constraints(
    std::vector<std::vector<Point>>& contours, Rect bounds, int iterations = 15
);
>>>>>>> dev_sync

} // namespace contours

#endif
