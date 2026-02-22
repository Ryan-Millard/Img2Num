#ifndef BEZIER_H
#define BEZIER_H

#include "internal/contours.h"

void fit_curve_reduction(const std::vector<std::vector<Point>> &chains,
                         std::vector<std::vector<QuadBezier>> &results, float tolerance);
#endif
