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

/// @brief Configuration options for image_to_svg.
/// @ingroup CIMG2NUM_H
typedef struct img2num_ImageToSvgConfig {

    /// Configuration settings for the bilateral filter in image_to_svg.
    struct BilateralFilterConfig {
        /// Standard deviation for spatial Gaussian (proximity weight).
        /// Higher values smooth over larger spatial neighborhoods.
        double sigma_spatial;
        /// Standard deviation for range Gaussian (intensity similarity weight).
        /// Higher values allow blending of more dissimilar pixel intensities.
        double sigma_range;
    } bilateral_filter;

    /// Configuration settings for K-Means in image_to_svg.
    struct KMeansConfig {
        /// Number of clusters to compute in K-Means.
        /// Roughly represents number of unique colors discovered.
        int32_t k;
        /// Maximum number of iterations for the K-Means algorithm.
        /// The algorithm may terminate earlier if it converges.
        int32_t max_iter;
    } kmeans;

    /// Minimum area (in pixels) for a region to be included in the SVG.
    int min_cluster_area;
    int min_thickness;

    /// Color space flag.
    /// - 0 = CIE LAB (more perceptually accurate)
    /// - 1 = sRGB (faster).
    uint8_t color_space;
} img2num_ImageToSvgConfig;

img2num_ImageToSvgConfig img2num_ImageToSvgConfig_default(void);

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
char *img2num_labels_to_svg(const uint8_t *data, const int32_t *labels, const int width,
                            const int height, const int min_area, const int min_thickness);

/// @copydoc ::IMG2NUM_H_IMAGE_TO_SVG_DOC
char *img2num_image_to_svg(const uint8_t *data, const int width, const int height,
                           const img2num_ImageToSvgConfig *config);
#ifdef __cplusplus
}
#endif

#endif  // CIMG2NUM_H
