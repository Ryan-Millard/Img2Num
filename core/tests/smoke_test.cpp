#include "img2num.h"

#include <catch2/catch_test_macros.hpp>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <unordered_set>

TEST_CASE("invert_image preserves alpha", "[core]") {
    uint8_t rgba[] {10, 20, 30, 40};

    img2num::invert_image(rgba, 1, 1);

    CHECK(rgba[0] == 245);
    CHECK(rgba[1] == 235);
    CHECK(rgba[2] == 225);
    CHECK(rgba[3] == 40);
};

TEST_CASE("bilateral filter succeeds", "[core]") {
    uint8_t rgba[] {128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,
                    128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,
                    128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255,
                    128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255, 128, 128, 128, 255};

    img2num::bilateral_filter(rgba, 4, 4, 1, 1, 1);

    CHECK(rgba[0] == 128);
    CHECK(rgba[1] == 128);
    CHECK(rgba[2] == 128);
    CHECK(rgba[3] == 255);
};

TEST_CASE("kmeans succeeds", "[core]") {
    uint8_t rgba[] {127, 127, 127, 255, 127, 127, 127, 255, 127, 127, 127, 255, 127, 127, 127, 255,

                    127, 127, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 127, 127, 127, 255,

                    127, 127, 127, 255, 255, 255, 255, 255, 255, 255, 255, 255, 127, 127, 127, 255,

                    127, 127, 127, 255, 127, 127, 127, 255, 127, 127, 127, 255, 127, 127, 127, 255};
    uint8_t out_rgba[64] = {255};
    int32_t labels[16] = {-1};

    img2num::kmeans(rgba, out_rgba, labels, 4, 4, 2, 100, 0);

    std::cout << std::to_string(static_cast<int>(out_rgba[0])) << ", "
              << std::to_string(static_cast<int>(out_rgba[1])) << ", "
              << std::to_string(static_cast<int>(out_rgba[2])) << ", "
              << std::to_string(static_cast<int>(out_rgba[3])) << std::endl;

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
    uint8_t rgba[] {0, 0, 0, 255, 0,   0,   0,   255, 0,   0,   0,   255, 0, 0, 0, 255,

                    0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255,

                    0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255,

                    0, 0, 0, 255, 0,   0,   0,   255, 0,   0,   0,   255, 0, 0, 0, 255};

    img2num::ImageToSvgConfig cfg;
    cfg.bilateral_filter.sigma_spatial = 1.0;
    cfg.kmeans.k = 2;
    cfg.min_thickness = 0;
    cfg.min_cluster_area = 0;
    cfg.color_space = 1;

    std::string res_svg;
    res_svg = img2num::image_to_svg(rgba, 4, 4, cfg);

    std::cout << res_svg << std::endl;
    CHECK(res_svg.rfind("<svg", 0) == 0);
};

TEST_CASE("labels_to_svg converts a simple labeled image to SVG") {
    const uint8_t data[] = {255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255};

    const int32_t labels[] = {0, 0, 0, 0};

    const std::string svg = img2num::labels_to_svg(data, labels, 2, 2, 1, 0);

    REQUIRE_FALSE(svg.empty());
    REQUIRE(svg.find("<svg") != std::string::npos);
    REQUIRE(svg.find("width=\"2\"") != std::string::npos);
    REQUIRE(svg.find("height=\"2\"") != std::string::npos);
    REQUIRE(svg.find("</svg>") != std::string::npos);
}

TEST_CASE("labels_to_svg handles multiple labeled regions") {
    const uint8_t data[] = {255, 0, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255};

    const int32_t labels[] = {0, 1, 0, 1};

    const std::string svg = img2num::labels_to_svg(data, labels, 2, 2, 1, 0);

    REQUIRE_FALSE(svg.empty());
    REQUIRE(svg.find("<svg") != std::string::npos);
    REQUIRE(svg.find("width=\"2\"") != std::string::npos);
    REQUIRE(svg.find("height=\"2\"") != std::string::npos);
    REQUIRE(svg.find("</svg>") != std::string::npos);

    std::size_t path_count = 0;
    std::size_t position = 0;

    while ((position = svg.find("<path", position)) != std::string::npos) {
        ++path_count;
        position += 5;
    }

    REQUIRE(path_count >= 2);
}