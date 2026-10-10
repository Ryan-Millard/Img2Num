#include <catch_amalgamated.hpp>
#include <img2num.h>

TEST_CASE("labels_to_svg converts a simple labeled image to SVG")
{
    const uint8_t data[] = {
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255
    };

    const int32_t labels[] = {
        0, 0,
        0, 0
    };

    const std::string svg = labels_to_svg(
        data,
        labels,
        2,
        2,
        1,
        0
    );

    REQUIRE_FALSE(svg.empty());
    REQUIRE(svg.find("<svg") != std::string::npos);
    REQUIRE(svg.find("width=\"2\"") != std::string::npos);
    REQUIRE(svg.find("height=\"2\"") != std::string::npos);
    REQUIRE(svg.find("</svg>") != std::string::npos);
}


TEST_CASE("labels_to_svg handles multiple labeled regions")
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

    const std::string svg = labels_to_svg(
        data,
        labels,
        2,
        2,
        1,
        0
    );

    REQUIRE_FALSE(svg.empty());
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
}
