#ifndef MORPHOLOGY_H
#define MORPHOLOGY_H

#include <vector>
#include <cmath>
#include <algorithm>
#include <map>
#include <set>

#include <cstdint>
#include "contours.h"

void skeletonize(std::vector<uint8_t>& img, int width, int height);
std::vector<std::vector<Point>> computeSubpixelCenterlines(const std::vector<uint8_t>& skelImg, int width, int height);
std::vector<std::vector<Point>> getAtomicRegions(const std::vector<std::vector<Point>>& chains);
#endif