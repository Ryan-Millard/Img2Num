#ifndef BEZIER_H
#define BEZIER_H

#include "contours.h"
#include <cmath>
#include <limits>
#include <vector>

// defined in contours.h
/*struct QuadBezier {
    Point p0; // Start
    Point p1; // Control
    Point p2; // End
};*/

void fitCurveReduction(const std::vector<std::vector<Point>> &chains,
                       std::vector<std::vector<QuadBezier>> &results,
                       float tolerance);
#endif