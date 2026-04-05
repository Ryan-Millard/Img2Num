#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb/stb_image_write.h>

#include <cimg2num.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>

#ifndef OUTPUT_DIR
#define OUTPUT_DIR "./console-c-outputs"
#endif

const int NUM_CHANNELS = 4;
const double SIGMA_WIDTH_RATIO = 0.005;

// Simple mkdir for C (create parents as needed)
int mkdir_recursive(const char* path) {
#ifdef _WIN32
    return _mkdir(path);
#else
    if (mkdir(path, 0755) == 0 || errno == EEXIST) return 0;
    return -1;
#endif
}

int main(int argc, char** argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <image_file>\n", argv[0]);
        return 1;
    }

    // Ensure output directory exists
    if (mkdir_recursive(OUTPUT_DIR) != 0) {
        fprintf(stderr, "Failed to create directory: %s\n", OUTPUT_DIR);
        return 1;
    }

    const char* image_path = argv[1];
    int width, height, channels;

    uint8_t* image_data_original = stbi_load(image_path, &width, &height, &channels, NUM_CHANNELS);
    if (!image_data_original) {
        fprintf(stderr, "Failed to load image: %s\n", stbi_failure_reason());
        return 1;
    }

    printf("Image loaded: %dx%d with %d channel(s).\n", width, height, NUM_CHANNELS);

    size_t img_size = (size_t)width * (size_t)height * NUM_CHANNELS;
    uint8_t* img_data = (uint8_t*)malloc(img_size);
    uint8_t* out_data = (uint8_t*)malloc(img_size);
    int32_t* out_labels = (int32_t*)malloc(width * height * sizeof(int32_t));
    char* res_svg;

    if (!img_data || !out_data || !out_labels) {
        fprintf(stderr, "Failed to allocate memory\n");
        stbi_image_free(image_data_original);
        free(img_data); free(out_data); free(out_labels);
        return 1;
    }

    memcpy(img_data, image_data_original, img_size);

    // Apply bilateral (C API)
    double sigma = width * SIGMA_WIDTH_RATIO;
    img2num_bilateral_filter(img_data, width, height, sigma, 50.0, 0);

    // Apply kmeans (C API)
    img2num_kmeans(img_data, out_data, out_labels, width, height, 16, 100, 1);

    // Generate SVG
    res_svg = img2num_labels_to_svg(img_data, out_labels, width, height, 100);

    // Save outputs
    char out_path[512];
    char kmeans_path[512];
    char svg_path[512];
    snprintf(out_path, sizeof(out_path), "%s/console-c-output.png", OUTPUT_DIR);
    snprintf(kmeans_path, sizeof(kmeans_path), "%s/console-c-kmeans.png", OUTPUT_DIR);
    snprintf(svg_path, sizeof(svg_path), "%s/console-c-svg.svg", OUTPUT_DIR);

    int exit_code = 0;
    const bool blur_save_success = stbi_write_png(out_path, width, height, NUM_CHANNELS, img_data, width * NUM_CHANNELS);
    const bool kmeans_save_success = stbi_write_png(kmeans_path, width, height, NUM_CHANNELS, out_data, width * NUM_CHANNELS);

    FILE* file = fopen(svg_path, "w");
    if (file == NULL) {
        printf("Error: Could not open the file!\n");
        exit_code == 1;
    }

    if (exit_code == 0) {
        fputs(res_svg, file);
        fclose(file);
    }

    if (blur_save_success && kmeans_save_success && (exit_code == 0)) {
        printf("\n\nSUCCESS!\nThe below images have been saved:\n\t- %s\n\t- %s\n\t- %s\n", out_path, kmeans_path, svg_path);
    } else {
        fprintf(stderr, "Failed to save images!\n");
        exit_code = 1;
    }

    stbi_image_free(image_data_original);
    free(img_data);
    free(out_data);
    free(out_labels);
    return exit_code;
}
