#ifndef FIND_CONTOURS_H
#define FIND_CONTOURS_H

#include "RGBAPixel.h"
#include <cstdint>
#include <cstddef>
#include <utility>
#include <vector>

namespace contours {
  class Contour {
    public:
      std::vector<std::pair<int,int>> points;

      // Indices in flat Contour container
      int parent_index = -1;
      int first_child_index = -1;
      int next_sibling_index = -1;
      int prev_sibling_index = -1;

      const inline ImageLib::RGBAPixel<uint8_t>& inner_pixel() noexcept {
        return inner_pixel_;
      }
      inline void set_inner_pixel(ImageLib::RGBAPixel<uint8_t> new_px) noexcept {
        if (!is_inner_pixel_set_) {
          inner_pixel_ = new_px;
        }
      }

    private:
      ImageLib::RGBAPixel<uint8_t> inner_pixel_;
      bool is_inner_pixel_set_ = false;
  };

  void find_contours(const uint8_t* pixels, size_t width, size_t height, std::vector<Contour>& contours);
}

#endif // FIND_CONTOURS_H
