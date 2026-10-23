#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <cstddef>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

#include <img2num.h>

constexpr const char* OUT_DIR {"./console-cpp-outputs"};

constexpr int NUM_CHANNELS {4};
constexpr double SIGMA_WIDTH_RATIO {0.005};
constexpr int MAX_ITER {100};

int main(int argc, char** argv)
{
    if (argc < 2) {
        std::cerr << "Usage: "
                  << argv[0]
                  << " <image_file> [optional] synthetic flag"
                  << std::endl;
        return 1;
    }

    const bool is_synthetic {
        (argc == 3) ? (std::stoi(argv[2]) > 0) : false
    };

    const std::string image_path {argv[1]};

    int width {0};
    int height {0};
    int channels {0};

    uint8_t* image_data_original {
        stbi_load(
            image_path.c_str(),
            &width,
            &height,
            &channels,
            NUM_CHANNELS
        )
    };

    if (!image_data_original) {
        std::cerr << "Failed to load image: "
                  << stbi_failure_reason()
                  << std::endl;
        return 1;
    }

    std::error_code ec;
    std::filesystem::create_directories(OUT_DIR, ec);

    if (ec) {
        std::cerr << "Failed to create output directory: "
                  << ec.message()
                  << std::endl;

        stbi_image_free(image_data_original);
        return 1;
    }

    const size_t pixel_count {static_cast<size_t>(width) * static_cast<size_t>(height)};

    const size_t byte_count {pixel_count * NUM_CHANNELS};

    std::cout
        << "Image loaded: "
        << width << "x" << height
        << " with "
        << NUM_CHANNELS << " channels."
        << std::endl;

    std::vector<uint8_t> img_data {image_data_original, image_data_original + byte_count};

    stbi_image_free(image_data_original);

    std::vector<uint8_t> out_data(byte_count);
    std::vector<int32_t> out_labels(pixel_count);

    const double sigma {static_cast<double>(width) * SIGMA_WIDTH_RATIO};

    if (is_synthetic) {
        std::cout << "Processing Synthetic image" << std::endl;

        img2num::color_quantize(
            img_data.data(),
            out_data.data(),
            out_labels.data(),
            width,
            height,
            0, // k (number of colors)
            0.95f, // coverage
            0 // CIE LAB color_space
        );
    } else {
        std::cout << "Processing Natural image" << std::endl;

        img2num::bilateral_filter(
            img_data.data(),
            width,
            height,
            sigma,
            50.0, // sigma_range
            0 // CIE LAB color_space
        );

        img2num::kmeans(
            img_data.data(),
            out_data.data(),
            out_labels.data(),
            width,
            height,
            32, // k (number of colors)
            MAX_ITER,
            0 // CIE LAB color_space
        );
    }

    std::string res_svg {
        img2num::labels_to_svg(
            out_data.data(),
            out_labels.data(),
            width,
            height,
            100, // min_area
            10 // min_thickness
        )
    };

    img2num::ImageToSvgConfig config;

    config.min_cluster_area = 100;
    config.min_thickness = 10;
    config.color_space = 0;

    if (is_synthetic) {
        config.image_type = img2num::ImageType::Synthetic;

        config.synthetic_image_config.quantize.k = 0;
        config.synthetic_image_config.quantize.coverage = 0.90f;
    } else {
        config.image_type = img2num::ImageType::Natural;

        config.natural_image_config.bilateral_filter.sigma_spatial = sigma;
        config.natural_image_config.bilateral_filter.sigma_range = 50.0;

        config.natural_image_config.kmeans.k = 32;
        config.natural_image_config.kmeans.max_iter = MAX_ITER;
    }

    std::cout << "Processing with image_to_svg" << std::endl;

    const std::string res_svg2 {
        img2num::image_to_svg(
            img_data.data(),
            width,
            height,
            config
        )
    };

    const std::string bilateral_path {std::string(OUT_DIR) + "/console-cpp-bilateral.png"};
    const std::string clustered_path {std::string(OUT_DIR) + "/console-cpp-clustered.png"};
    const std::string svg_path {std::string(OUT_DIR) + "/console-cpp-svg.svg"};
    const std::string svg2_path {std::string(OUT_DIR) + "/console-cpp-svg2.svg"};

    const bool bilateral_save_success {
        stbi_write_png(
            bilateral_path.c_str(),
            width,
            height,
            NUM_CHANNELS,
            img_data.data(),
            width * NUM_CHANNELS
        ) == 1
    };

    const bool clustered_save_success {
        stbi_write_png(
            clustered_path.c_str(),
            width,
            height,
            NUM_CHANNELS,
            out_data.data(),
            width * NUM_CHANNELS
        ) == 1
    };

    auto write_text =
        [](const std::string& path, const std::string& content) -> bool {
            std::ofstream file(path);

            if (!file.is_open()) {
                std::cerr << "Could not open " << path << std::endl;
                return false;
            }

            file << content;
            return !file.fail();
        };

    const bool svg_save_success {write_text(svg_path, res_svg)};
    const bool svg2_save_success {write_text(svg2_path, res_svg2)};

    if (bilateral_save_success && clustered_save_success &&
        svg_save_success && svg2_save_success) {
        std::cout
            << "\nSUCCESS!\n\n"
            << "Generated files:\n"
            << "  - " << bilateral_path << '\n'
            << "  - " << clustered_path << '\n'
            << "  - " << svg_path << '\n'
            << "  - " << svg2_path << '\n';

        return 0;
    }

    std::cerr << "Failed to save one or more outputs." << std::endl;
    return 1;
}
