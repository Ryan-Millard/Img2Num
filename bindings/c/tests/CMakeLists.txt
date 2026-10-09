# =================================================================
# Img2Num C bindings tests
# Enabled with -DIMG2NUM_BUILD_TESTS=ON
# =================================================================
# Written in C on purpose: proves the public header works from a C compiler.
project(CImg2NumTests LANGUAGES C)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

add_executable(CImg2NumTests test_image_to_svg_errors.c)

target_link_libraries(CImg2NumTests PRIVATE CImg2Num)

# CImg2Num (and the core it wraps) are C++ libraries, so link with the C++ driver.
set_target_properties(CImg2NumTests PROPERTIES LINKER_LANGUAGE CXX)

add_test(NAME c_image_to_svg_errors COMMAND CImg2NumTests)
