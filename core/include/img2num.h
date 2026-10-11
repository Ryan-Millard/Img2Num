/** @file img2num.h
 *  @brief Core image processing functions for img2num project.
 *  @details This file declares functions for image manipulation, clustering, filtering,
 *           and conversion to SVG. Functions operate on raw image buffers (uint8_t*).
 * @defgroup IMG2NUM_H Img2Num Core Functions
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
};

/// @brief Apply a Gaussian blur to an image using FFT.
/// @ingroup IMG2NUM_H
/// @param image Pointer to the image buffer (RGBA).
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param sigma Standard deviation for Gaussian kernel.
/// @note The operation modifies the image buffer in-place.
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma);

/// @brief Invert the pixel values of an image.
/// @ingroup IMG2NUM_H
/// @param ptr Pointer to the image buffer.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @note Each pixel value is replaced by 255 - original_value.
void invert_image(uint8_t* ptr, int width, int height);

/// @brief Apply a thresholding operation to an image.
/// @ingroup IMG2NUM_H
/// @param ptr Pointer to the image buffer.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param num_thresholds Number of thresholds to apply.
/// @note Thresholds split pixel intensity ranges into discrete levels.
void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds);

/// @brief Apply black-thresholding to an image.
/// @ingroup IMG2NUM_H
/// @param ptr Pointer to the image buffer.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param num_thresholds Number of thresholds to apply.
/// @note Similar to threshold_image but prioritizes darker pixels.
void black_threshold_image(
    uint8_t* ptr, const int width, const int height, const int num_thresholds
);

/// @brief Perform k-means clustering on image data.
/// @ingroup IMG2NUM_H
/// @param data Pointer to input image data buffer.
/// @param out_data Pointer to output buffer where clustered pixel values are stored.
/// @param out_labels Pointer to output buffer for cluster labels per pixel.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param k Number of clusters to compute.
/// @param max_iter Maximum number of iterations for the algorithm.
/// @param color_space Color space flag (0 = CIE LAB, 1 = RGB).
/// @note The function does not modify the input buffer.
void kmeans(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space
);

/// @brief Apply bilateral filtering to an image.
/// @ingroup IMG2NUM_H
/// @param image Pointer to RGBA pixel buffer.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param sigma_spatial Standard deviation for spatial Gaussian (proximity weight).
/// @param sigma_range Standard deviation for range Gaussian (intensity similarity weight).
/// @param color_space Color space flag (0 = CIE LAB, 1 = RGB).
/// @note The filter modifies the image buffer in-place.
void bilateral_filter(
    uint8_t* image, size_t width, size_t height, double sigma_spatial, double sigma_range,
    uint8_t color_space
);

/// @brief Convert labeled regions of an image into an SVG string.
/// @ingroup IMG2NUM_H
/// @param data Pointer to image data buffer.
/// @param labels Pointer to label buffer, indicating region for each pixel.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param min_area Minimum area (in pixels) for a region to be included in the SVG.
/// @return std::string A valid SVG string containing the data.
std::string labels_to_svg(
    const uint8_t* data, const int32_t* labels, const int width, const int height,
    const int min_area, const int min_thickness
);

/// @brief Convert labeled regions of an image into an SVG string.
/// @ingroup IMG2NUM_H
/// @param data Pointer to image data buffer.
/// @param width Width of the image in pixels.
/// @param height Height of the image in pixels.
/// @param config img2num_ImageToSvgConfig configuration struct.
/// @return std::string An SVG string containing data roughly approximate to the input image.
/// @throws std::invalid_argument If the input image or configuration is invalid.
std::string image_to_svg(
    const uint8_t* data, const int width, const int height, const ImageToSvgConfig& config
);

} // namespace img2num

#endif // IMG2NUM_H
