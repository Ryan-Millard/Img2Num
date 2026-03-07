#ifndef KMEANS_GPU_H
#define KMEANS_GPU_H

void kmeans_gpu(const uint8_t *data, uint8_t *out_data,
                     int32_t *out_labels, const int32_t width,
                     const int32_t height, const int32_t k,
                     const int32_t max_iter, const uint8_t color_space);

#endif