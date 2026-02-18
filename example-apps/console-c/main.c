#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <cimg2num.h>

int main(int argc, char** argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <image_file>\n", argv[0]);
        return 1;
    }

    const char* imagePath = argv[1];
    int width, height, channels;

    // Load image as RGBA
    uint8_t* imgDataOriginal = stbi_load(imagePath, &width, &height, &channels, 4);
    if (!imgDataOriginal) {
        fprintf(stderr, "Failed to load image: %s\n", stbi_failure_reason());
        return 1;
    }

    printf("Image loaded: %dx%d with 4 channels.\n", width, height);

    // Allocate a copy of the image
    const size_t img_size = (size_t)width * (size_t)height * 4;
    uint8_t* imgData = (uint8_t*)malloc(img_size);
    if (!imgData) {
        fprintf(stderr, "Failed to allocate memory for image copy\n");
        stbi_image_free(imgDataOriginal);
        return 1;
    }
    memcpy(imgData, imgDataOriginal, img_size);

    // Apply Gaussian blur using C API
    double sigma = width * 0.005;
    gaussian_blur_fft(imgData, width, height, sigma);

    // Save blurred image
    const char* outPath = "console-c-output.png";
    if (!stbi_write_png(outPath, width, height, 4, imgData, width * 4)) {
        fprintf(stderr, "Failed to save blurred image!\n");
    } else {
        printf("Blurred image saved to: %s\n", outPath);
    }

    stbi_image_free(imgDataOriginal);
    free(imgData);
    return 0;
}
