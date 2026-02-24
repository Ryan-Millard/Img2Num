/** @file cimg2num.h
 *  @brief Core image processing functions for img2num project.
 *  @details This file declares functions for image manipulation, clustering, filtering,
 *           and conversion to SVG. Functions operate on raw image buffers (uint8_t*).
 *  @defgroup CIMG2NUM_H Img2Num Core Functions for C
 *  @note Dox File: `doxygen/img2num.h.dox`
 */
#ifndef CIMG2NUM_H
#define CIMG2NUM_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/// @copydoc ::IMG2NUM_H_GAUSSIAN_BLUR_DOC
void img2num_gaussian_blur_fft(uint8_t *image, size_t width, size_t height, double sigma);

/// @copydoc ::IMG2NUM_H_INVERT_IMAGE_DOC
void img2num_invert_image(uint8_t *ptr, int width, int height);

/// @copydoc ::IMG2NUM_H_THRESHOLD_IMAGE_DOC
void img2num_threshold_image(uint8_t *ptr, const int width, const int height,
                             const int num_thresholds);

/// @copydoc ::IMG2NUM_H_BLACK_THRESHOLD_IMAGE_DOC
void img2num_black_threshold_image(uint8_t *ptr, const int width, const int height,
                                   const int num_thresholds);

/// @copydoc ::IMG2NUM_H_KMEANS_DOC
void img2num_kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
                    const int32_t width, const int32_t height, const int32_t k,
                    const int32_t max_iter, const uint8_t color_space);

/// @copydoc ::IMG2NUM_H_BILATERAL_FILTER_DOC
void img2num_bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_spatial,
                              double sigma_range, uint8_t color_space);

/// @copydoc ::IMG2NUM_H_LABELS_TO_SVG_DOC
char *img2num_labels_to_svg(uint8_t *data, int32_t *labels, const int width, const int height,
                            const int min_area, const bool draw_contour_borders);

#ifdef __cplusplus
}
#endif

#endif  // CIMG2NUM_H
