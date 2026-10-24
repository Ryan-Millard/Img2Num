#include "img2num.h"

#include <catch2/catch_test_macros.hpp>
#include <cstdint>

TEST_CASE("invert_image preserves alpha", "[core]") {
    uint8_t rgba[] {10, 20, 30, 40};

    img2num::invert_image(rgba, 1, 1);

    CHECK(rgba[0] == 245);
    CHECK(rgba[1] == 235);
    CHECK(rgba[2] == 225);
    CHECK(rgba[3] == 40);
}
