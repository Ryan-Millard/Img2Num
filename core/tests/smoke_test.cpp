#include "img2num.h"

#include <catch2/catch_test_macros.hpp>
#include <cstdint>
#include <cstring>
#include <unordered_set>
#include <iostream>

TEST_CASE("invert_image preserves alpha", "[core]") {
    uint8_t rgba[] {10, 20, 30, 40};

    img2num::invert_image(rgba, 1, 1);

    CHECK(rgba[0] == 245);
    CHECK(rgba[1] == 235);
    CHECK(rgba[2] == 225);
    CHECK(rgba[3] == 40);
};

TEST_CASE("bilateral filter succeeds", "[core]") {
    uint8_t rgba[] {
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255,
        128, 128, 128, 255
    };

    img2num::bilateral_filter(rgba, 4, 4, 1, 1, 1);

    CHECK(rgba[0] == 128);
    CHECK(rgba[1] == 128);
    CHECK(rgba[2] == 128);
    CHECK(rgba[3] == 255);
};

TEST_CASE("kmeans succeeds", "[core]") {
    uint8_t rgba[] {
        127, 127, 127, 255,
        127, 127, 127, 255,
        127, 127, 127, 255,
        127, 127, 127, 255,

        127, 127, 127, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        127, 127, 127, 255,

        127, 127, 127, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        127, 127, 127, 255,

        127, 127, 127, 255,
        127, 127, 127, 255,
        127, 127, 127, 255,
        127, 127, 127, 255
    };
    uint8_t out_rgba[64] = {255};
    int32_t labels[16] = {-1};

    img2num::kmeans(rgba, out_rgba, labels, 4, 4, 2, 100, 0);

    std::cout << std::to_string(static_cast<int>(out_rgba[0])) \
    << ", " << std::to_string(static_cast<int>(out_rgba[1])) \
    << ", " << std::to_string(static_cast<int>(out_rgba[2])) \
    << ", " << std::to_string(static_cast<int>(out_rgba[3])) << std::endl;

    // unique labels
    size_t length = sizeof(labels) / sizeof(int32_t);
    std::unordered_set<int> unique_set(labels, labels + length);
    std::cout << "Unique elements: ";
    for (int val : unique_set) {
        std::cout << val << " ";
    }

    CHECK(out_rgba[0] == 127);
    CHECK(out_rgba[1] == 127);
    CHECK(out_rgba[2] == 127);
    CHECK(out_rgba[3] == 255);
    CHECK(unique_set.size() == 2);
};

TEST_CASE("image to svg succeeds", "[core]") {
    uint8_t rgba[] {
        0, 0, 0, 255,
        0, 0, 0, 255,
        0, 0, 0, 255,
        0, 0, 0, 255,

        0, 0, 0, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        0, 0, 0, 255,

        0, 0, 0, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        0, 0, 0, 255,

        0, 0, 0, 255,
        0, 0, 0, 255,
        0, 0, 0, 255,
        0, 0, 0, 255
    };
    
    img2num::ImageToSvgConfig cfg;
    cfg.bilateral_filter.sigma_spatial=1.0;
    cfg.kmeans.k = 2;
    cfg.min_thickness = 0;
    cfg.min_cluster_area = 0;
    cfg.color_space = 1;

    std::string res_svg;
    res_svg = img2num::image_to_svg(rgba, 4, 4, cfg);

    std::cout << res_svg << std::endl;
    CHECK(res_svg.rfind("<svg", 0) == 0);
};