# =================================================================
# Img2Num Core (C++) tests
# Enabled with -DIMG2NUM_BUILD_TESTS=ON
# =================================================================
add_executable(Img2NumCoreTests test_image_to_svg_validation.cpp)

target_link_libraries(Img2NumCoreTests PRIVATE Img2Num)

# validation.h is an internal header
target_include_directories(Img2NumCoreTests PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/../include/internal
)

target_compile_options(Img2NumCoreTests PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})

add_test(NAME core_image_to_svg_validation COMMAND Img2NumCoreTests)
