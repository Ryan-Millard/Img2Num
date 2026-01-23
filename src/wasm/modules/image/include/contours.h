#ifndef CONTOURS_H
#define CONTOURS_H

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <stdexcept>
#include <vector>
#include <algorithm>
#include <iterator>
#include <map>
#include <utility>

// will start as integer values but can be adjusted to subpixel positions
struct Point {
  float x = 0;
  float y = 0;
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

void stitchIntegerGrid(std::vector<Point>& vecA, std::vector<Point>& vecB);
void stitchUnique(std::vector<Point>& vecA, std::vector<Point>& vecB);
void stitchSmooth(std::vector<Point>& vecA, std::vector<Point>& vecB);
}
#endif