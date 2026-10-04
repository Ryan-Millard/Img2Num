#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <cstddef>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <img2num.h>
#include <iostream>
#include <stb/stb_image_write.h>
#include <string>
#include <vector>

#ifndef OUTPUT_DIR
#define OUTPUT_DIR "./console-cpp-outputs"
#endif

constexpr const char* OUT_DIR {OUTPUT_DIR};

constexpr int NUM_CHANNELS {4};
constexpr double SIGMA_WIDTH_RATIO {0.005};
constexpr int MAX_ITER {100};

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <image_file>" << std::endl;
        return 1;
    }

    std::string image_path {argv[1]};
    int width {0}, height {0}, channels {0};
    // Force load as RGBA (NUM_CHANNELS = 4)
    uint8_t* image_data_original {
        stbi_load(image_path.c_str(), &width, &height, &channels, NUM_CHANNELS)};
    if (!image_data_original) {
        std::cerr << "Failed to load image: " << stbi_failure_reason() << std::endl;
        return 1;
    }

    // Ensure output directory exists
    std::error_code ec;
    std::filesystem::create_directories(OUT_DIR, ec);
    if (ec) {
        std::cerr << "Failed to create directory: " << ec.message() << "\n";
        stbi_image_free(image_data_original);
        return 1;
    }

    const size_t pixel_count {static_cast<size_t>(width) * static_cast<size_t>(height)};
    const size_t byte_count {pixel_count * NUM_CHANNELS};

    std::cout << "Image loaded: " << width << "x" << height << " with " << NUM_CHANNELS
              << " channel(s)." << std::endl;

    // Working copy of the original image
    std::vector<uint8_t> img_data(image_data_original, image_data_original + byte_count);
    std::vector<uint8_t> out_data(byte_count);
    std::vector<int32_t> out_labels(pixel_count);

    stbi_image_free(image_data_original);

    // Apply bilateral
    const double sigma {width * SIGMA_WIDTH_RATIO};
    img2num::bilateral_filter(img_data.data(), width, height, sigma, 50.0, 0);
    // Apply kmeans
    img2num::kmeans(img_data.data(), out_data.data(), out_labels.data(), width, height, 32, 100, 1);
    // Generate SVG from labels
    std::string res_svg {
        img2num::labels_to_svg(img_data.data(), out_labels.data(), width, height, 100, 10)};

    // Generate SVG with the full pipeline
    img2num::ImageToSvgConfig config;
    config.kmeans.k = 32;
    config.min_thickness = 10;
    std::string res_svg2 {img2num::image_to_svg(img_data.data(), width, height, config)};

    const std::string bilateral_path {std::string(OUT_DIR) + "/console-cpp-bilateral.png"};
    const std::string kmeans_path {std::string(OUT_DIR) + "/console-cpp-kmeans.png"};
    const std::string svg_path {std::string(OUT_DIR) + "/console-cpp-svg.svg"};
    const std::string svg2_path {std::string(OUT_DIR) + "/console-cpp-svg2.svg"};

    const bool bilateral_save_success {
        stbi_write_png(
            bilateral_path.c_str(), width, height, NUM_CHANNELS, img_data.data(),
            width * NUM_CHANNELS
        ) == 1};
    const bool kmeans_save_success {
        stbi_write_png(
            kmeans_path.c_str(), width, height, NUM_CHANNELS, out_data.data(), width * NUM_CHANNELS
        ) == 1};

    auto write_text = [](const std::string& path, const std::string& content) {
        std::ofstream file(path);
        if (!file.is_open()) {
            std::cerr << "Error: Could not open " << path << std::endl;
            return false;
        }
        file << content;
        file.close();
        return !file.fail();
    };
    const bool svg_save_success {write_text(svg_path, res_svg)};
    const bool svg2_save_success {write_text(svg2_path, res_svg2)};

    if (bilateral_save_success && kmeans_save_success && svg_save_success && svg2_save_success) {
        std::cout << "\n\nSUCCESS!\nThe below images have been saved:\n\t- " << bilateral_path
                  << "\n\t- " << kmeans_path << "\n\t- " << svg_path << "\n\t- " << svg2_path
                  << std::endl;
        return 0;
    }

    std::cerr << "Failed to save images!" << std::endl;
    return 1;
}
