#ifndef KMEANS_GRAPH_H
#define KMEANS_GRAPH_H

#include "exported.h" // EXPORTED macro

#include <cstdint>

EXPORTED char *labels_to_svg(uint8_t *data, int32_t *labels, const int width,
                             const int height, const int min_area,
                             const bool draw_contour_borders);
#endif
