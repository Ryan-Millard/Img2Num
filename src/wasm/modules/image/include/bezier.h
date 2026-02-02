#ifndef BEZIER_H
#define BEZIER_H

#include "contours.h"
#include <cmath>
#include <limits>
#include <vector>

void fitCurveReduction(const std::vector<std::vector<Point>> &chains,
                       std::vector<std::vector<QuadBezier>> &results,
                       float tolerance);
#endif