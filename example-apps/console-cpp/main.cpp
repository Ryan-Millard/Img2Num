#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <iostream>
#include <cstdint>
#include <string>
#include <cstring>
#include <filesystem>

#include <img2num.h>

#ifndef OUTPUT_DIR
#define OUTPUT_DIR "./console-cpp-outputs"
#endif

constexpr const char* OUT_DIR{OUTPUT_DIR};

constexpr int NUM_CHANNELS{4};
constexpr double SIGMA_WIDTH_RATIO{0.005};

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <image_file>" << std::endl;
        return 1;
    }

    std::string image_path{argv[1]};
    int width{0}, height{0}, channels{0};
    // Force load as grayscale
    uint8_t* image_data_original{stbi_load(image_path.c_str(), &width, &height, &channels, NUM_CHANNELS)};
    if (!image_data_original) {
        std::cerr << "Failed to load image: " << stbi_failure_reason() << std::endl;
        return 1;
    }

    // Ensure output directory exists
    std::error_code ec;
    std::filesystem::create_directories(OUT_DIR, ec);
    if (ec) {
        std::cerr << "Failed to create directory: " << ec.message() << "\n";
        return 1;
    }

    uint8_t* img_data{new uint8_t[width * height * NUM_CHANNELS]};
    uint8_t* out_data{new uint8_t[width * height * NUM_CHANNELS]};
    int32_t* out_labels{new int32_t[width * height]};

    for (int ITER=0; ITER<2; ITER++){
    std::cout << "Image loaded: " << width << "x" << height << " with " << NUM_CHANNELS << " channel(s)." << std::endl;

    // Allocate a copy of the original image
    // uint8_t* img_data{new uint8_t[width * height * NUM_CHANNELS]};
    std::memcpy(img_data, image_data_original, static_cast<size_t>(width) * static_cast<size_t>(height) * NUM_CHANNELS);

    // Apply bilateral
    const double sigma{width * SIGMA_WIDTH_RATIO};
    img2num::bilateral_filter(img_data, width, height, sigma, 50.0, 0);

    

    img2num::kmeans(img_data, out_data, out_labels, width, height, 16, 100, 1);
    
    }
    // Save the blurred image
    std::string out_path{std::string(OUT_DIR) + "/console-cpp-output.png"};
    std::string kmeans_path{std::string(OUT_DIR) + "/console-cpp-kmeans.png"};

    int exit_code{0};
    const bool blur_save_success{stbi_write_png(out_path.c_str(), width, height, NUM_CHANNELS, img_data, width * NUM_CHANNELS) == 1 ? true : false};
    const bool kmeans_save_success{stbi_write_png(kmeans_path.c_str(), width, height, NUM_CHANNELS, out_data, width * NUM_CHANNELS) == 1 ? true : false};
    if (blur_save_success && kmeans_save_success) {
        std::cout << "\n\nSUCCESS!\nThe below images have been saved:\n\t- " << out_path << "\n\t- " << kmeans_path << std::endl;
    } else {
        std::cerr << "Failed to save images!" << std::endl;
        exit_code = 1;
    }

    stbi_image_free(image_data_original);
    delete[] img_data;
    delete[] out_data;
    delete[] out_labels;
    return exit_code;
}
