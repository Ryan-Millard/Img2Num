#include "img2num.h"
#include "validation.h"

#include <cstring>
#include <vector>

namespace img2num {
std::string image_to_svg(
    const uint8_t* data, const int width, const int height, const ImageToSvgConfig& config
) {
    // Reject bad input before allocating anything. Throws std::invalid_argument.
    validate_image_to_svg_args(data, width, height, config);

    const size_t pixel_count {static_cast<size_t>(width) * static_cast<size_t>(height)};
    const size_t byte_count {pixel_count * 4}; // overflow already ruled out by validation

    // self deallocate
    std::vector<uint8_t> img_data(byte_count);
    std::vector<uint8_t> out_data(byte_count);
    std::vector<int32_t> out_labels(pixel_count);

    std::memcpy(img_data.data(), data, byte_count);
    bilateral_filter(
        img_data.data(), width, height, config.bilateral_filter.sigma_spatial,
        config.bilateral_filter.sigma_range, config.color_space
    );
    kmeans(
        img_data.data(), out_data.data(), out_labels.data(), width, height, config.kmeans.k,
        config.kmeans.max_iter, config.color_space
    );
    std::string svg {labels_to_svg(
        data, out_labels.data(), width, height, config.min_cluster_area, config.min_thickness
    )};

    return svg;
}
} // namespace img2num