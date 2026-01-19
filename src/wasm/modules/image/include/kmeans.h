#ifndef KMEANS_H
#define KMEANS_H

#include "exported.h" // EXPORTED macro

#include <cstdint>

EXPORTED void kmeans(const uint8_t *data, uint8_t *out_data,
                     int32_t *out_labels, const int32_t width,
                     const int32_t height, const int32_t k,
                     const int32_t max_iter, const uint8_t n_threads);

EXPORTED void kmeans_clustering_spatial(uint8_t *data, int32_t width,
                                        int32_t height, int32_t k,
                                        int32_t max_iter,
                                        float spatial_weight = 1.0);

#endif
