#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <cimg2num.h>

const int NUM_CHANNELS = 4;
const double SIGMA_WIDTH_RATIO = 0.005;

int main(int argc, char** argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <image_file>\n", argv[0]);
        return 1;
    }

    const char* image_data = argv[1];
    int width, height, channels;

    // Load image as RGBA
    uint8_t* image_data_original = stbi_load(image_data, &width, &height, &channels, NUM_CHANNELS);
    if (!image_data_original) {
        fprintf(stderr, "Failed to load image: %s\n", stbi_failure_reason());
        return 1;
    }

    printf("Image loaded: %dx%d with %d channels.\n", width, height, NUM_CHANNELS);

    // Allocate a copy of the image
    const size_t img_size = (size_t)width * (size_t)height * NUM_CHANNELS;
    uint8_t* img_data = (uint8_t*)malloc(img_size);
    if (!img_data) {
        fprintf(stderr, "Failed to allocate memory for image copy\n");
        stbi_image_free(image_data_original);
        return 1;
    }
    memcpy(img_data, image_data_original, img_size);

    // Apply Gaussian blur using C API
    double sigma = width * SIGMA_WIDTH_RATIO;
    img2num_gaussian_blur_fft(img_data, width, height, sigma);

    // Save blurred image
    const char* out_path = "console-c-output.png";
    if (!stbi_write_png(out_path, width, height, NUM_CHANNELS, img_data, width * NUM_CHANNELS)) {
        fprintf(stderr, "Failed to save blurred image!\n");
    } else {
        printf("Blurred image saved to: %s\n", out_path);
    }

    stbi_image_free(image_data_original);
    free(img_data);
    return 0;
}
