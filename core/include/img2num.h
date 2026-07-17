/** @file img2num.h
 *  @brief Core image processing functions for img2num project.
 *  @details This file declares functions for image manipulation, clustering, filtering,
 *           and conversion to SVG. Functions operate on raw image buffers (uint8_t*).
 * @defgroup IMG2NUM_H Img2Num Core Functions
 * @note Dox File: `doxygen/img2num.h.dox`
 */
#ifndef IMG2NUM_H
#define IMG2NUM_H

#include <cstddef>
#include <cstdint>
#include <string>

/// @note All image buffers are assumed to be stored in row-major order, unless otherwise noted.
namespace img2num {

/// @brief Configuration options for image_to_svg.
/// @ingroup IMG2NUM_H
struct ImageToSvgConfig {
    /// Configuration settings for the bilateral filter in image_to_svg.
    struct BilateralFilterConfig {
        /// Standard deviation for spatial Gaussian (proximity weight).
        /// Higher values smooth over larger spatial neighborhoods.
        double sigma_spatial = 3.0;
        /// Standard deviation for range Gaussian (intensity similarity weight).
        /// Higher values allow blending of more dissimilar pixel intensities.
        double sigma_range = 50.0;
    } bilateral_filter;

    /// Configuration settings for K-Means in image_to_svg.
    struct KMeansConfig {
        /// Number of clusters to compute in K-Means.
        /// Roughly represents number of unique colors discovered.
        int32_t k = 16;
        /// Maximum number of iterations for the K-Means algorithm.
        /// The algorithm may terminate earlier if it converges.
        int32_t max_iter = 100;
    } kmeans;

    struct QuantizeConfig {
        /// Number of dominant colors to find in the image.
        /// If 0 (default) use `coverage` to threshold based on area.
        int32_t k;
        /// Area ratio to consider when determining dominant colors.
        /// Top dominant colors must cover at least `coverage` * `width` * `height` number of pixels.
        /// Example: 0.38 means that the top dominant colors must cover at least 38% of the image's pixels
        float coverage;
    } quantize;

    /// Minimum area (in pixels) for a region to be included in the SVG.
    int min_cluster_area = 100;

    /// Minimum thickness (in pixels) for a region to be included in the SVG.
    /// Regions with an inscribed disk diameter less than this value are merged.
    /// Set to 0 to disable thickness-based filtering.
    int min_thickness = 0;

    /// Color space flag.
    /// - 0 = CIE LAB (more perceptually accurate)
    /// - 1 = sRGB (faster).
    uint8_t color_space = 0;

    /// Synthetic flag.
    /// - 0 = Natural image (default)
    /// - 1 = Synthetic image
    uint8_t synthetic = 0;
};

/// @copydoc IMG2NUM_H_GAUSSIAN_BLUR_DOC
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma);

/// @copydoc IMG2NUM_H_INVERT_IMAGE_DOC
void invert_image(uint8_t* ptr, int width, int height);

/// @copydoc IMG2NUM_H_THRESHOLD_IMAGE_DOC
void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);

/// @copydoc IMG2NUM_H_BLACK_THRESHOLD_IMAGE_DOC
void black_threshold_image(
    uint8_t* ptr, const int width, const int height, const int num_thresholds
);

/// @copydoc IMG2NUM_H_KMEANS_DOC
void kmeans(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space
);

void color_quantize(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const float coverage, const uint8_t color_space
);

/// @copydoc IMG2NUM_H_BILATERAL_FILTER_DOC
void bilateral_filter(
    uint8_t* image, size_t width, size_t height, double sigma_spatial, double sigma_range,
    uint8_t color_space
);

/// @copydoc IMG2NUM_H_LABELS_TO_SVG_DOC
std::string labels_to_svg(
    const uint8_t* data, const int32_t* labels, const int width, const int height,
    const int min_area, const int min_thickness
);

/// @copydoc IMG2NUM_H_IMAGE_TO_SVG_DOC
std::string image_to_svg(
    const uint8_t* data, const int width, const int height, const ImageToSvgConfig& config
);

} // namespace img2num

#endif // IMG2NUM_H
