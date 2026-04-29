#include <cstring>
#include <vector>

#include "img2num.h"

namespace img2num {
std::string image_to_svg(const uint8_t *data, const int width, const int height,
                         double sigma_spatial, double sigma_range, const int32_t k,
                         const int32_t max_iter, const int min_area, const uint8_t color_space) {
    // self deallocate
    std::vector<uint8_t> img_data(width * height * 4);
    std::vector<uint8_t> out_data(width * height * 4);
    std::vector<int32_t> out_labels(width * height);

    std::memcpy(img_data.data(), data,
                static_cast<size_t>(width) * static_cast<size_t>(height) * 4);
    bilateral_filter(img_data.data(), width, height, sigma_spatial, sigma_range, color_space);
    kmeans(img_data.data(), out_data.data(), out_labels.data(), width, height, k, max_iter,
           color_space);
    std::string svg{labels_to_svg(data, out_labels.data(), width, height, min_area)};

    return svg;
}
}  // namespace img2num