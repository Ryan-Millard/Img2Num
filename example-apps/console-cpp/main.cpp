#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <img2num.h>
#include <iostream>
#include <stb/stb_image_write.h>
#include <string>
#include <vector>
#include <thread>

#ifndef OUTPUT_DIR
#define OUTPUT_DIR "./console-cpp-outputs"
#endif

constexpr const char* OUT_DIR {OUTPUT_DIR};

constexpr int NUM_CHANNELS {4};
constexpr double SIGMA_WIDTH_RATIO {0.005};
constexpr int MAX_ITER {100};

void step_by_step(
    uint8_t* image_data_original,
    std::vector<uint8_t>& bilateral_data, 
    std::vector<uint8_t>& kmeans_data,
    int width, int height,
    double sigma_spatial, double sigma_range,
    int k, int max_iter,
    int min_cluster_area, int min_thickness,
    uint8_t color_space,
    std::string& res_svg
){
    const size_t pixel_count {static_cast<size_t>(width) * static_cast<size_t>(height)};
    const size_t byte_count {pixel_count * NUM_CHANNELS};

    std::memcpy(bilateral_data.data(), image_data_original, byte_count);
    std::vector<int32_t> out_labels(pixel_count);

    img2num::bilateral_filter(bilateral_data.data(), width, height, sigma_spatial, sigma_range, color_space);
    // Apply kmeans
    img2num::kmeans(bilateral_data.data(), kmeans_data.data(), out_labels.data(), width, height, k, max_iter, color_space);
    // Generate SVG from labels
    res_svg = img2num::labels_to_svg(bilateral_data.data(), out_labels.data(), width, height, min_cluster_area, min_thickness); 
}

void combined_process(
    uint8_t* image_data_original,
    int width, int height,
    img2num::ImageToSvgConfig& cfg,
    std::string& res_svg
) {
    const size_t pixel_count {static_cast<size_t>(width) * static_cast<size_t>(height)};
    const size_t byte_count {pixel_count * NUM_CHANNELS};

    std::vector<uint8_t> img_data(image_data_original, image_data_original + byte_count);
    res_svg = img2num::image_to_svg(img_data.data(), width, height, cfg);
}

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <image_file>" << std::endl;
        return 1;
    }

    std::string image_path {argv[1]};
    int width {0}, height {0}, channels {0};
    // Force load as RGBA (NUM_CHANNELS = 4)
    uint8_t* image_data_original {
        stbi_load(image_path.c_str(), &width, &height, &channels, NUM_CHANNELS)
    };
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
    // std::vector<uint8_t> img_data(image_data_original, image_data_original + byte_count);
    std::vector<uint8_t> img_data(byte_count);
    std::vector<uint8_t> out_data(byte_count);

    std::string res_svg1;
    std::string res_svg2;
    std::string res_svg3;
    std::string res_svg4;


    // Bilateral sigma_spatial
    const double sigma {width * SIGMA_WIDTH_RATIO};

    // Generate SVG with the full pipeline
    img2num::ImageToSvgConfig config;
    config.color_space = 0;
    config.bilateral_filter.sigma_spatial = sigma;
    config.kmeans.k = 32;
    config.min_thickness = 10;

    // Basic example - runs each process one at a time
    step_by_step(
        image_data_original, img_data, 
        out_data, width, height, sigma, 50.0,
        32, 100, 100, 10, 0, res_svg1
    );

    combined_process(image_data_original, width, height, config, res_svg2);

    // Multithreading example - runs processes in parallel with threading
    std::thread t1( 
        step_by_step, image_data_original, 
        std::ref(img_data), std::ref(out_data), width, height, sigma, 50.0,
        32, 100, 100, 10, 0, std::ref(res_svg3)
    );

    std::thread t2(
        combined_process, image_data_original, 
        width, height, std::ref(config), std::ref(res_svg4)
    );

    t1.join();
    t2.join();

    stbi_image_free(image_data_original);

    const std::string bilateral_path {std::string(OUT_DIR) + "/console-cpp-bilateral.png"};
    const std::string kmeans_path {std::string(OUT_DIR) + "/console-cpp-kmeans.png"};
    const std::string svg1_path {std::string(OUT_DIR) + "/console-cpp-svg1.svg"};
    const std::string svg2_path {std::string(OUT_DIR) + "/console-cpp-svg2.svg"};
    const std::string svg3_path {std::string(OUT_DIR) + "/console-cpp-svg3.svg"};
    const std::string svg4_path {std::string(OUT_DIR) + "/console-cpp-svg4.svg"};

    const bool bilateral_save_success {
        stbi_write_png(
            bilateral_path.c_str(), width, height, NUM_CHANNELS, img_data.data(),
            width * NUM_CHANNELS
        ) == 1
    };
    const bool kmeans_save_success {
        stbi_write_png(
            kmeans_path.c_str(), width, height, NUM_CHANNELS, out_data.data(), width * NUM_CHANNELS
        ) == 1
    };

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
    const bool svg1_save_success {write_text(svg1_path, res_svg1)};
    const bool svg2_save_success {write_text(svg2_path, res_svg2)};
    const bool svg3_save_success {write_text(svg3_path, res_svg3)};
    const bool svg4_save_success {write_text(svg4_path, res_svg4)};

    if (
        bilateral_save_success && kmeans_save_success && 
        svg1_save_success && svg2_save_success &&
        svg3_save_success && svg4_save_success
    ) {
        std::cout << "\n\nSUCCESS!\nThe below images have been saved:\n\t- " << bilateral_path
                  << "\n\t- " << kmeans_path << "\n\t- " << svg1_path << "\n\t- " << svg2_path
                  << "\n\t- " << svg3_path << "\n\t- " << svg4_path
                  << std::endl;
        return 0;
    }

    std::cerr << "Failed to save images!" << std::endl;
    return 1;
}
