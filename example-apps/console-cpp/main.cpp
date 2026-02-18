#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <iostream>
#include <cstdint>
#include <string>
#include <cstring>

#include <img2num.h>

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

    std::cout << "Image loaded: " << width << "x" << height << " with " << channels + 1 << " channel(s)." << std::endl;

    // Allocate a copy of the original image
    uint8_t* img_data{new uint8_t[width * height * NUM_CHANNELS]};
    std::memcpy(img_data, image_data_original, width * height * NUM_CHANNELS);

    // Apply Gaussian blur
    const double sigma{width * SIGMA_WIDTH_RATIO};
    img2num::gaussian_blur_fft(img_data, width, height, sigma);

    // Save the blurred image
    std::string out_path{"console-cpp-output.png"};
    if (!stbi_write_png(out_path.c_str(), width, height, NUM_CHANNELS, img_data, width * NUM_CHANNELS)) {
        std::cerr << "Failed to save blurred image!" << std::endl;
    } else {
        std::cout << "Blurred image saved to: " << out_path << std::endl;
    }

    stbi_image_free(image_data_original);
    delete[] img_data;
    return 0;
}
