#ifndef CONTOURS_H
#define CONTOURS_H

#include <vector>
#include <array>
#include <cstdint>
#include <cmath>
#include <stdexcept>
#include <cstdlib>

struct Point {
    int x = 0;
    int y = 0;
};

struct ContoursResult {
    // contours[k] is a sequence of boundary pixels (x,y) in image coordinates (0..w-1, 0..h-1)
    std::vector<std::vector<Point>> contours;

    // hierarchy[k] = { next_sibling, prev_sibling, first_child, parent }
    // -1 means "none"
    std::vector<std::array<int, 4>> hierarchy;

    // is_hole[k] == true if contour k is a hole border
    std::vector<bool> is_hole;
};

namespace contours {
    ContoursResult find_contours(const std::vector<uint8_t>& binary, int width, int height);
}
#endif