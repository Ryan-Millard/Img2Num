#ifndef KMEANS_H
#define KMEANS_H

#include "exported.h" // EXPORTED macro

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <iostream>
#include <limits>
#include <vector>

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"

struct RGB {
  float r, g, b;
};
struct RGBXY {
  float r, g, b;
  float x, y;
};

float colorDistance(const RGB &a, const RGB &b);
float colorSpatialDistance(const RGBXY &a, const RGBXY &b,
                           float spatial_weight);

EXPORTED void kmeans(
    const uint8_t *data, uint8_t* out_data,
    int* out_labels,
    const int width, const int height, const int k,
    const int max_iter);
EXPORTED void kmeans_clustering_spatial(uint8_t *data, int width, int height,
                                        int k, int max_iter,
                                        float spatial_weight = 1.0);

#endif
