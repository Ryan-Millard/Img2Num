#include "visualize_contours.h"
#include "RGBAPixel.h"
#include "Image.h"
#include "PixelConverters.h"
#include <vector>
#include <cstring>
#include <random>
#include <algorithm>

// Generate a random color
ImageLib::RGBAPixel<uint8_t> generate_unique_color(std::vector<ImageLib::RGBAPixel<uint8_t>>& used_colors) {
  static std::mt19937 rng(std::random_device{}());
  static std::uniform_int_distribution<int> dist(0, 255);

  while (true) {
    ImageLib::RGBAPixel<uint8_t> color{
      static_cast<uint8_t>(dist(rng)),
        static_cast<uint8_t>(dist(rng)),
        static_cast<uint8_t>(dist(rng)),
        255
    };

    // Check if this color was already used
    bool exists = std::any_of(used_colors.begin(), used_colors.end(),
        [&](const auto& c) {
        return c.red == color.red && c.green == color.green && c.blue == color.blue;
        });

    if (!exists) {
      used_colors.push_back(color);
      return color;
    }
  }
}

void visualize_contours(uint8_t* pixels, size_t width, size_t height) {
  std::vector<contours::Contour> contours;
  contours::find_contours(pixels, width, height, contours);

  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> image;
  image.loadFromBuffer(pixels, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

  std::vector<ImageLib::RGBAPixel<uint8_t>> used_colors;

  for (const auto& c : contours) {
    // Generate a unique random color for this contour
    ImageLib::RGBAPixel<uint8_t> color = generate_unique_color(used_colors);

    for (const auto& [x, y] : c.points) {
      image(x, y) = color;
    }
  }

  const auto &modified = image.getData();
  std::memcpy(pixels, modified.data(),
      modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}
