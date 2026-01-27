#ifndef CONTOURS_H
#define CONTOURS_H

#include "Image.h"
#include "PixelConverters.h"
#include "Point.h"
#include "RGBAPixel.h"
#include "SavitskyGolay.h"
#include <array>
#include <cstdint>
#include <cstdlib>
#include <stdexcept>
#include <vector>
#include <algorithm>
#include <iterator>
#include <map>
#include <utility>
#include <set>

struct QuadBezier {
  Point p0{0, 0}; // Start
  Point p1{0, 0}; // Control
  Point p2{0, 0}; // End
};

struct Rect {
  float x, y, width, height;
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
ContoursResult find_contours(const std::vector<uint8_t> &binary, int width,
                             int height);

void stitch_smooth(std::vector<Point> &vecA, std::vector<Point> &vecB);
void coupled_smooth(std::vector<std::vector<Point>> &contours, Rect bounds);

void pack_with_boundary_constraints(std::vector<std::vector<Point>> &contours,
                                    Rect bounds, int iterations = 15);

} // namespace contours

#endif