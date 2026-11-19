#define STB_IMAGE_IMPLEMENTATION
#include <stb/stb_image.h>
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <cimg2num.h>
#include <cimg2num/img2num_error_t.h>
#include <errno.h>
#include <stb/stb_image_write.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>

#ifdef _WIN32
#include <direct.h>
#endif

#ifndef OUTPUT_DIR
#define OUTPUT_DIR "./console-c-outputs"
#endif

const int NUM_CHANNELS = 4;
const double SIGMA_WIDTH_RATIO = 0.005;

#ifdef _WIN32
#define MAKE_DIR(path) _mkdir(path)
#else
#define MAKE_DIR(path) mkdir(path, 0755)
#endif

// Make one directory. Already existing is fine.
static int make_one_dir(const char* path) {
    if (MAKE_DIR(path) == 0 || errno == EEXIST)
        return 0;
    return -1;
}

// Make a directory and all its missing parents (like `mkdir -p`).
int mkdir_recursive(const char* path) {
    char tmp[512];
    size_t len = strlen(path);
    if (len == 0 || len >= sizeof(tmp))
        return -1;
    memcpy(tmp, path, len + 1);

    // Walk the path. Each time we hit a slash, create the folder before it.
    // Start at 1 so a leading "/" is not treated as an empty folder name.
    for (size_t i = 1; i < len; i++) {
        if (tmp[i] != '/' && tmp[i] != '\\')
            continue;
        if (tmp[i - 1] == ':')
            continue; // Windows drive like "C:/", can't be created
        char saved = tmp[i];
        tmp[i] = '\0';
        if (make_one_dir(tmp) != 0)
            return -1;
        tmp[i] = saved;
    }
    return make_one_dir(tmp);
}

// Write a string to a file. Returns true on success.
static bool write_text_file(const char* path, const char* text) {
    FILE* file = fopen(path, "w");
    if (file == NULL) {
        fprintf(stderr, "Error: could not open file for writing: %s\n", path);
        return false;
    }
    bool ok = fputs(text, file) >= 0;
    if (fclose(file) != 0)
        ok = false;
    return ok;
}

// Print which step failed, plus the reason from the Img2Num C API.
static void print_img2num_error(const char* what) {
    const char* msg = img2num_get_last_error_message();
    fprintf(stderr, "%s: %s\n", what, (msg && msg[0]) ? msg : "unknown error");
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
    int width = 0, height = 0, channels = 0;
    int exit_code = 1; // assume failure, only set to 0 at the very end

    // Everything that needs freeing starts as NULL, so the cleanup at the
    // bottom is safe no matter where we jump from.
    uint8_t* image_data_original = NULL;
    uint8_t* img_data = NULL;
    uint8_t* out_data = NULL;
    int32_t* out_labels = NULL;
    char* res_svg = NULL;
    char* res_svg2 = NULL;

    size_t img_size = 0;
    size_t labels_size = 0;
    size_t row_stride = 0;
    double sigma = 0.0;

    char out_path[512];
    char kmeans_path[512];
    char svg_path[512];
    char svg2_path[512];

    img2num_ImageToSvgConfig cfg;
    bool blur_save_success = false;
    bool kmeans_save_success = false;
    bool svg_save_success = false;
    bool svg2_save_success = false;

    image_data_original = stbi_load(image_path, &width, &height, &channels, NUM_CHANNELS);
    if (!image_data_original) {
        fprintf(stderr, "Failed to load image: %s\n", stbi_failure_reason());
        goto cleanup;
    }

    printf("Image loaded: %dx%d with %d channel(s).\n", width, height, NUM_CHANNELS);

    img_size = (size_t)width * (size_t)height * (size_t)NUM_CHANNELS;
    labels_size = (size_t)width * (size_t)height * sizeof(int32_t);
    row_stride = (size_t)width * (size_t)NUM_CHANNELS;
    img_data = (uint8_t*)malloc(img_size);
    out_data = (uint8_t*)malloc(img_size);
    out_labels = (int32_t*)malloc(labels_size);
    if (!img_data || !out_data || !out_labels) {
        fprintf(stderr, "Failed to allocate memory\n");
        goto cleanup;
    }

    memcpy(img_data, image_data_original, img_size);

    // Apply bilateral (C API)
    sigma = width * SIGMA_WIDTH_RATIO;
    img2num_bilateral_filter(img_data, width, height, sigma, 50.0, 0);
    // Apply kmeans (C API)
    img2num_kmeans(img_data, out_data, out_labels, width, height, 16, 100, 1);
    // Generate SVG step by step
    res_svg = img2num_labels_to_svg(img_data, out_labels, width, height, 100, 0);
    if (res_svg == NULL) {
        print_img2num_error("Failed to generate SVG step-by-step");
        goto cleanup;
    }

    // Generate SVG in one call
    cfg = img2num_ImageToSvgConfig_default();
    res_svg2 = img2num_image_to_svg(image_data_original, width, height, &cfg);
    if (res_svg2 == NULL) {
        print_img2num_error("Failed to generate SVG in unified call");
        goto cleanup;
    }

    // Save outputs
    snprintf(out_path, sizeof(out_path), "%s/console-c-output.png", OUTPUT_DIR);
    snprintf(kmeans_path, sizeof(kmeans_path), "%s/console-c-kmeans.png", OUTPUT_DIR);
    snprintf(svg_path, sizeof(svg_path), "%s/console-c-svg.svg", OUTPUT_DIR);
    snprintf(svg2_path, sizeof(svg2_path), "%s/console-c-svg2.svg", OUTPUT_DIR);

    blur_save_success =
        stbi_write_png(out_path, width, height, NUM_CHANNELS, img_data, (int)row_stride) != 0;
    kmeans_save_success =
        stbi_write_png(kmeans_path, width, height, NUM_CHANNELS, out_data, (int)row_stride) != 0;
    svg_save_success = write_text_file(svg_path, res_svg);
    svg2_save_success = write_text_file(svg2_path, res_svg2);

    if (!(blur_save_success && kmeans_save_success && svg_save_success && svg2_save_success)) {
        fprintf(stderr, "Failed to save images!\n");
        goto cleanup;
    }

    printf(
        "\n\nSUCCESS!\nThe below files have been saved:\n\t- %s\n\t- %s\n\t- %s\n\t- %s\n",
        out_path, kmeans_path, svg_path, svg2_path
    );
    exit_code = 0;

cleanup:
    stbi_image_free(image_data_original);
    free(img_data);
    free(out_data);
    free(out_labels);
    free(res_svg);
    free(res_svg2);
    return exit_code;
}
