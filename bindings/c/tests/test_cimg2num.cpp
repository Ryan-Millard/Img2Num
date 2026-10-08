#include <catch_amalgamated.hpp>

#include <cimg2num.h>

#include <cstdlib>
#include <cstring>
#include <string>

TEST_CASE("C ABI labels_to_svg returns valid SVG")
{
    const uint8_t data[] = {
        255, 0, 0, 255,
        0, 0, 255, 255,
        255, 0, 0, 255,
        0, 0, 255, 255
    };

    const int32_t labels[] = {
        0, 1,
        0, 1
    };

    char* result = img2num_labels_to_svg(
        data,
        labels,
        2,2,1,0
    );

    REQUIRE(result != nullptr);

    const std::size_t length = std::strlen(result);
    REQUIRE(length > 0);

    const std::string svg(result, length);

    REQUIRE(svg.find("<svg") != std::string::npos);
    REQUIRE(svg.find("width=\"2\"") != std::string::npos);
    REQUIRE(svg.find("height=\"2\"") != std::string::npos);
    REQUIRE(svg.find("</svg>") != std::string::npos);

    std::size_t path_count = 0;
    std::size_t position = 0;

    while ((position = svg.find("<path", position)) != std::string::npos)
    {
        ++path_count;
        position += 5;
    }

    REQUIRE(path_count >= 2);

    std::free(result);
}

TEST_CASE("C ABI ImageToSvgConfig default has valid fields")
{
    const img2num_ImageToSvgConfig config =
        img2num_ImageToSvgConfig_default();

    REQUIRE(config.bilateral_filter.sigma_spatial > 0.0);
    REQUIRE(config.bilateral_filter.sigma_range > 0.0);

    REQUIRE(config.kmeans.k > 0);
    REQUIRE(config.kmeans.max_iter > 0);

    REQUIRE(config.min_cluster_area >= 0);
    REQUIRE(config.min_thickness >= 0);

    REQUIRE(config.color_space <= 1);
}
