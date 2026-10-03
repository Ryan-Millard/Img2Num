// Tests for the input validation at the top of img2num::image_to_svg().
//
// Every "bad input" case must throw std::invalid_argument *before* any image
// processing happens, so these tests never need a GPU or real pixel data.
// Deliberately framework-free (plain main + CHECK) so it adds no dependency.

#include "img2num.h"
#include "validation.h"

#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

int failures {0};

#define CHECK(cond)                                                                                \
    do {                                                                                           \
        if (!(cond)) {                                                                             \
            std::cerr << __FILE__ << ":" << __LINE__ << ": CHECK failed: " #cond << "\n";          \
            ++failures;                                                                            \
        }                                                                                          \
    } while (0)

// Run `fn`; expect std::invalid_argument whose message contains `needle`.
template <typename Fn> void expect_invalid(const char* label, const std::string& needle, Fn fn) {
    try {
        fn();
    } catch (const std::invalid_argument& e) {
        if (std::string(e.what()).find(needle) == std::string::npos) {
            std::cerr << "[" << label << "] message \"" << e.what() << "\" lacks \"" << needle
                      << "\"\n";
            ++failures;
        }
        return;
    } catch (const std::exception& e) {
        std::cerr << "[" << label << "] wrong exception type: " << e.what() << "\n";
        ++failures;
        return;
    }
    std::cerr << "[" << label << "] expected std::invalid_argument, nothing thrown\n";
    ++failures;
}

using img2num::ImageToSvgConfig;

std::string run(const uint8_t* data, int w, int h, const ImageToSvgConfig& cfg) {
    return img2num::image_to_svg(data, w, h, cfg);
}

} // namespace

int main() {
    const std::vector<uint8_t> buf(64 * 64 * 4, 128);
    const uint8_t* px {buf.data()};
    const ImageToSvgConfig ok {};

    // ---- null / dimensions ----
    expect_invalid("null data", "null", [&] { run(nullptr, 64, 64, ok); });
    expect_invalid("zero width", "positive", [&] { run(px, 0, 64, ok); });
    expect_invalid("zero height", "positive", [&] { run(px, 64, 0, ok); });
    expect_invalid("negative width", "positive", [&] { run(px, -5, 64, ok); });
    expect_invalid("negative height", "positive", [&] { run(px, 64, -5, ok); });
    expect_invalid("INT_MIN width", "positive", [&] {
        run(px, std::numeric_limits<int>::min(), 64, ok);
    });

    // ---- minimum size (shortest side >= 16) ----
    expect_invalid("1x1", "too small", [&] { run(px, 1, 1, ok); });
    expect_invalid("width 15", "too small", [&] { run(px, 15, 64, ok); });
    expect_invalid("height 15", "too small", [&] { run(px, 64, 15, ok); });
    expect_invalid("tall thin", "too small", [&] { run(px, 4000, 3, ok); });

    // ---- overflow of width * height * 4 ----
    constexpr size_t big {std::numeric_limits<size_t>::max()};
    expect_invalid("w*h overflow", "overflow", [&] { img2num::checked_rgba_byte_count(big, 2); });
    expect_invalid("w*h*4 overflow", "overflow", [&] {
        img2num::checked_rgba_byte_count(big / 2, 1);
    });
    CHECK(img2num::checked_rgba_byte_count(0, 123) == 0);
    CHECK(img2num::checked_rgba_byte_count(64, 64) == 64u * 64u * 4u);
    // On 64-bit targets, INT_MAX * INT_MAX fits in size_t; this exercises the
    // int32_t pixel-count limit rather than checked_rgba_byte_count overflow.
    expect_invalid("huge pixel count", "too large", [&] {
        run(px, std::numeric_limits<int>::max(), std::numeric_limits<int>::max(), ok);
    });

    // ---- config sanity ----
    {
        ImageToSvgConfig c;
        c.kmeans.k = 0;
        expect_invalid("k = 0", "kmeans.k", [&] { run(px, 64, 64, c); });
        c.kmeans.k = -3;
        expect_invalid("k < 0", "kmeans.k", [&] { run(px, 64, 64, c); });
        c.kmeans.k = 64 * 64 + 1;
        expect_invalid("k > pixels", "pixels", [&] { run(px, 64, 64, c); });
    }
    {
        ImageToSvgConfig c;
        c.kmeans.max_iter = 0;
        expect_invalid("max_iter = 0", "max_iter", [&] { run(px, 64, 64, c); });
    }
    {
        ImageToSvgConfig c;
        c.bilateral_filter.sigma_spatial = 0.0;
        expect_invalid("sigma_spatial = 0", "sigma_spatial", [&] { run(px, 64, 64, c); });
        c.bilateral_filter.sigma_spatial = -1.0;
        expect_invalid("sigma_spatial < 0", "sigma_spatial", [&] { run(px, 64, 64, c); });
        c.bilateral_filter.sigma_spatial = std::numeric_limits<double>::quiet_NaN();
        expect_invalid("sigma_spatial NaN", "sigma_spatial", [&] { run(px, 64, 64, c); });
        c.bilateral_filter.sigma_spatial = std::numeric_limits<double>::infinity();
        expect_invalid("sigma_spatial inf", "sigma_spatial", [&] { run(px, 64, 64, c); });
    }
    {
        ImageToSvgConfig c;
        c.bilateral_filter.sigma_range = 0.0;
        expect_invalid("sigma_range = 0", "sigma_range", [&] { run(px, 64, 64, c); });
        c.bilateral_filter.sigma_range = -0.5;
        expect_invalid("sigma_range < 0", "sigma_range", [&] { run(px, 64, 64, c); });
    }
    {
        ImageToSvgConfig c;
        c.min_cluster_area = -1;
        expect_invalid("min_cluster_area < 0", "min_cluster_area", [&] { run(px, 64, 64, c); });
        c = ImageToSvgConfig {};
        c.min_thickness = -1;
        expect_invalid("min_thickness < 0", "min_thickness", [&] { run(px, 64, 64, c); });
        c = ImageToSvgConfig {};
        c.color_space = 2;
        expect_invalid("color_space = 2", "color_space", [&] { run(px, 64, 64, c); });
    }

    // ---- valid input must NOT be rejected (positive controls) ----
    try {
        img2num::validate_image_to_svg_args(px, 64, 64, ok);
        img2num::validate_image_to_svg_args(px, 16, 16, ok); // exactly the minimum
        ImageToSvgConfig edge;
        edge.kmeans.k = 16 * 16; // k == pixel count is allowed
        edge.kmeans.max_iter = 1;
        edge.min_cluster_area = 0;
        edge.min_thickness = 0; // 0 disables thickness filtering
        edge.color_space = 1;
        img2num::validate_image_to_svg_args(px, 16, 16, edge);
    } catch (const std::exception& e) {
        std::cerr << "valid input wrongly rejected: " << e.what() << "\n";
        ++failures;
    }

    if (failures != 0) {
        std::cerr << failures << " check(s) failed\n";
        return EXIT_FAILURE;
    }
    std::cout << "all validation tests passed\n";
    return EXIT_SUCCESS;
}
