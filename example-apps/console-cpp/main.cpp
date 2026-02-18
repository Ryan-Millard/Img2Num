#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <iostream>
#include <cstdint>
#include <string>
#include <cstring>

#include "img2num.h"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <image_file>" << std::endl;
        return 1;
    }

    std::string imagePath = argv[1];
    int width, height, channels;

    // Force load as grayscale
    uint8_t* imgDataOriginal = stbi_load(imagePath.c_str(), &width, &height, &channels, 4);
    if (!imgDataOriginal) {
        std::cerr << "Failed to load image: " << stbi_failure_reason() << std::endl;
        return 1;
    }

    std::cout << "Image loaded: " << width << "x" << height << " with " << channels + 1 << " channel(s)." << std::endl;

    // Allocate a copy of the original image
    uint8_t* imgData = new uint8_t[width * height * 4];
    std::memcpy(imgData, imgDataOriginal, width * height * 4);

    // Apply Gaussian blur with sigma=5% of image width
    double sigma = width * 0.005;
    img2num::gaussian_blur_fft(imgData, width, height, sigma);

    // Save the blurred image
    std::string outPath = "console-cpp-output.png";
    if (!stbi_write_png(outPath.c_str(), width, height, 4, imgData, width * 4)) {
        std::cerr << "Failed to save blurred image!" << std::endl;
    } else {
        std::cout << "Blurred image saved to: " << outPath << std::endl;
    }

    stbi_image_free(imgDataOriginal);
    delete[] imgData;
    return 0;
}
