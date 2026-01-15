#ifndef KMEANS_H
#define KMEANS_H

#include "exported.h" // EXPORTED macro

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <limits>
#include <vector>

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"

EXPORTED void kmeans(
    const uint8_t *data, uint8_t* out_data,
    int* out_labels,
    const int width, const int height, const int k,
    const int max_iter);

EXPORTED void kmeans_clustering_spatial(uint8_t *data, int width, int height,
                                        int k, int max_iter,
                                        float spatial_weight = 1.0);

#endif
