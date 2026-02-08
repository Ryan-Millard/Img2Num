#ifndef IMG2NUM_H
#define IMG2NUM_H

#include <cstdint>
#include <cstddef>

namespace img2num {
  // image_utils.cpp
  void gaussian_blur_fft(uint8_t *image, size_t width, size_t height,
      double sigma);
  void invert_image(uint8_t *ptr, int width, int height);
  void threshold_image(uint8_t *ptr, const int width, const int height,
      const int num_thresholds);
  void black_threshold_image(uint8_t *ptr, const int width,
      const int height, const int num_thresholds);

  // kmeans.cpp
  void kmeans(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
      const int32_t width, const int32_t height, const int32_t k,
      const int32_t max_iter, const uint8_t color_space);

  // bilateral_filter.cpp
  /*
   *Apply bilateral filter to an image.
   *The filter modifies the image buffer in-place.
   *Parameters:
   * - image: Pointer to RGBA pixel buffer
   * - width, height: Image dimensions (px)
   * - sigma_spatial: Gaussian standard deviation for spatial proximity (spatial
   * decay)
   * - sigma_range: Gaussian standard deviation for intensity difference
   * (radiometric decay)
   */
  void bilateral_filter(uint8_t *image, size_t width, size_t height,
                        double sigma_spatial, double sigma_range,
                        uint8_t color_space);

  // labels_to_svg.cpp
  char *labels_to_svg(uint8_t *data, int32_t *labels, const int width,
                               const int height, const int min_area,
                               const bool draw_contour_borders);
}

#endif // IMG2NUM_H
