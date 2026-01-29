#ifndef CONTOURS_H
#define CONTOURS_H

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <iterator>
#include <map>
#include <set>
#include <stdexcept>
#include <utility>
#include <vector>

// will start as integer values but can be adjusted to subpixel positions
struct Point {
  float x = 0;
  float y = 0;
};

struct Rect {
  float x, y, width, height;
};

struct ContoursResult {
  // contours[k] is a sequence of boundary pixels (x,y) in image coordinates
  // (0..w-1, 0..h-1)
  std::vector<std::vector<Point>> contours;

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

void stitchSmooth(std::vector<Point> &vecA, std::vector<Point> &vecB);
void coupledSmooth(std::vector<std::vector<Point>> &contours, Rect bounds);

void packWithBoundaryConstraints(std::vector<std::vector<Point>> &contours,
                                 Rect bounds, int iterations = 15);

} // namespace contours

#endif