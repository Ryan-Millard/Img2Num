// TODO: Update path finding logic to check if all neighbor pixels around contour are the same color,
//        if they are, we have a hole (child)
#include "find_contours.h"
#include "Image.h"
#include "PixelConverters.h"
#include <iostream>
#include <array>
#include <iostream>
#include <string>
inline void log(std::string s) {
  std::cout << s << std::endl;
}

namespace contours {
  // 8-neighbor offsets (dx, dy), clockwise order
  // 0   1   2
  // 7 [x,y] 3 <- [x,y]: param coordinates of reference pixel
  // 6   5   4
  constexpr std::array<std::array<int, 2>, 8> neighbor_offsets{{
    {{-1, -1}}, // 0: top-left
    {{ 0, -1}}, // 1: top
    {{ 1, -1}}, // 2: top-right
    {{ 1,  0}}, // 3: right
    {{ 1,  1}}, // 4: bottom-right
    {{ 0,  1}}, // 5: bottom
    {{-1,  1}}, // 6: bottom-left
    {{-1,  0}}  // 7: left
  }};


  static inline bool is_border_pixel(const ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>& image, int x, int y) {
    const auto& px = image(x, y);
    int width  = static_cast<int>(image.getWidth());
    int height = static_cast<int>(image.getHeight());

    for (auto& offset : neighbor_offsets) {
      int nx = x + offset[0];
      int ny = y + offset[1];

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      if (image(nx, ny) != px) return true; // neighbor differs → border
    }

    return false; // all neighbors same → interior pixel
  }

  static inline void update_label(int x, int y, int& label,
      const ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>& image) {
    const auto& px = image(x, y);

    if (!is_border_pixel(image, x, y)) {
      label = 3; // interior
    } else if (x != 0 && px != image(x - 1, y)) {
      label = 1; // outer
    } else {
      label = 2; // inner/hole
    }
  }

  static std::optional<std::pair<std::pair<int,int>, std::pair<int,int>>> find_next_contour_pixel(
    const ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>& image,
    const std::pair<int, int> current_contour_xy,
    const std::pair<int, int> prev_offset = {0, -1} // offset to find previous pixel on contour
    ) {
    const auto& [x, y] = current_contour_xy;
    const auto& [prev_dx, prev_dy] = prev_offset;
    const ImageLib::RGBAPixel<uint8_t>& reference_pixel{image(x, y)};

    int width{static_cast<int>(image.getWidth())};
    int height{static_cast<int>(image.getHeight())};

    // Find the index of the previous direction (previous pixel on contour)
    // This helps know where to start next loop
    // Below: p => prev neighbor, s => starting pixel in next loop
    //  0 | 1 | p       #       s | 1 | 2       #       0 | 1 | 2
    // -----------      #      -----------      #      -----------
    //  7 |   | s       #       p |   | 3       #       7 |   | 3
    // -----------      #      -----------      #      -----------
    //  6 | 5 | 4       #       6 | 5 | 4       #       s | p | 4
    int start_index{0};
    for (int i = 0; i < 8; ++i) {
      if (neighbor_offsets[i][0] == prev_dx && neighbor_offsets[i][1] == prev_dy) {
        start_index = (i + 1) % 8; // start scan after previous direction
                                   // % 8 ensures start_index < 8
        break;
      }
    }

    // Scan neighbors clockwise starting from start_index (ends at start_index - 1)
    bool prev_pixel_same_as_reference{false};
    for (int i{0}; i < 8; ++i) {
      int idx{(start_index + i) % 8};
      int nx{x + neighbor_offsets[idx][0]};
      int ny{y + neighbor_offsets[idx][1]};

      // Skip out-of-bounds
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        log("1. skipping neighbor at " + std::to_string(nx) + "," + std::to_string(ny));
        continue;
      }

      const ImageLib::RGBAPixel<uint8_t>& current_pixel = image(nx, ny);

      // Skip if not same contour
      if (prev_pixel_same_as_reference) {
        log("2. skipping neighbor at " + std::to_string(nx) + "," + std::to_string(ny));
        continue;
      }

      bool current_pixel_same_as_reference{current_pixel == reference_pixel};

      // Only consider pixels that are on the border
      if (current_pixel_same_as_reference && is_border_pixel(image, nx, ny)) {
        log("3. border pixel at " + std::to_string(nx) + "," + std::to_string(ny));
        return std::make_optional(
            std::make_pair(
              std::make_pair(nx, ny),
              std::make_pair(neighbor_offsets[idx][0], neighbor_offsets[idx][1])
              )
            );
      }

      log("4. incorrect at " + std::to_string(nx) + "," + std::to_string(ny));
      prev_pixel_same_as_reference = current_pixel_same_as_reference;
    }

    // No contour sibling pixel found
    return std::nullopt;
  }

  static Contour trace_contour(const int x, const int y, std::vector<std::vector<int>>& labels, const ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>& image) {
    if (!is_border_pixel(image, x, y)) {
      labels[y][x] = 3; // mark visited interior
      return Contour{};  // empty contour
    }

    const int& start_label{labels[y][x]};

    Contour contour;
    contour.set_inner_pixel(image(x, y));

    // Default previous offsets: top-left of 8 neighbor region
    std::pair<int, int> prev_dxy{0, -1};
    std::pair<int, int> prev_xy{x, y};

    while (true) {
        // Back at starting pixel
        if (labels[prev_xy.second][prev_xy.first] != -1) break;

        const std::optional<std::pair<std::pair<int,int>, std::pair<int,int>>> next_contour_pixel = find_next_contour_pixel(image, prev_xy, prev_dxy);
        // No contour sibling pixel found
        if (next_contour_pixel == std::nullopt) break;

        auto& [current_xy, current_dxy] = next_contour_pixel.value();
        auto& [current_x, current_y] = current_xy;
        update_label(current_x, current_y, labels[current_y][current_x], image);

        contour.points.push_back(current_xy);

        prev_xy = current_xy;
        prev_dxy = current_dxy;
      }

    return contour;
    }

    void find_contours(const uint8_t* pixels, size_t width, size_t height, std::vector<Contour>& contours) {
      ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>image;
      image.loadFromBuffer(pixels, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

      int image_width{static_cast<int>(width)};
      int image_height{static_cast<int>(height)};

      // 2D vector labels represent visited pixels in image (-1: unvisited)
      std::vector<std::vector<int>> labels(image_height, std::vector<int>(image_width, -1));

      // Flood-fill
      for (int y{0}; y < image_height; ++y) {
        for (int x{0}; x < image_width; ++x) {
          // Skip visited labels
          if (labels[y][x] != -1) continue;

          contours.push_back(trace_contour(x, y, labels, image));
        }
      }
    }
  }
