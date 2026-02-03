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

  Point operator+(const Point& other) const {
      return Point{x + other.x, y + other.y};
  }

  // Overload the - operator (subtraction)
  Point operator-(const Point& other) const {
      return Point{x - other.x, y - other.y};
  }

  // Overload the * operator (multiplication by a scalar)
  // The left operand is the class object (this), the right is a double.
  Point operator*(float scalar) const {
      return Point{x * scalar, y * scalar};
  }

  Point operator/(float scalar) const {
      return Point{x / scalar, y / scalar};
  }

  // Friend function to allow float * Vector
  friend Point operator*(float scalar, const Point& v) {
      return Point{v.x * scalar, v.y * scalar};; // Calls the member function for the actual logic
  }

  Point& operator+=(const Point& other){
      x += other.x;
      y += other.y;
      return *this;
  }

  static float distSq(Point a, Point b) {
    return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  }
  
};

struct QuadBezier {
  Point p0{0,0}; // Start
  Point p1{0,0}; // Control
  Point p2{0,0}; // End
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