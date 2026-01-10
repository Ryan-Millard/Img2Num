#include "visualize_contours.h"
#include "RGBAPixel.h"
#include "Image.h"
#include "PixelConverters.h"
#include <vector>
#include <cstring>

void visualize_contours(uint8_t* pixels, size_t width, size_t height) {
  std::vector<contours::Contour> contours;
  contours::find_contours(pixels, width, height, contours);

  const ImageLib::RGBAPixel<uint8_t> red{255,0,0,255};
  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>>image;
  image.loadFromBuffer(pixels, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

  for (const auto& c : contours) {
    for (const auto& [x, y] : c.points) {
      image(x, y) = red;
    }
  }

  const auto &modified = image.getData();
  std::memcpy(pixels, modified.data(),
      modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}
