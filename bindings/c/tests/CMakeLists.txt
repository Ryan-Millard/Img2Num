# add_subdirectory(
#   "${PROJECT_SOURCE_DIR}/third_party/tests"
#   "${CMAKE_CURRENT_BINARY_DIR}/catch2_build"
#   EXCLUDE_FROM_ALL
# )

list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/third_party/tests/extras")
include(Catch)

add_executable(test_cimg2num
  test_cimg2num.cpp
)

target_include_directories(test_cimg2num BEFORE PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/../include
)

target_include_directories(test_cimg2num PRIVATE ${PROJECT_SOURCE_DIR}/third_party/tests)

target_link_libraries(test_cimg2num PRIVATE CImg2Num)
target_link_libraries(test_cimg2num PRIVATE Catch2::Catch2WithMain)

catch_discover_tests(test_cimg2num DISCOVERY_MODE PRE_TEST)

# add_test(
#     NAME cimg2num
#     COMMAND test_cimg2num
# )