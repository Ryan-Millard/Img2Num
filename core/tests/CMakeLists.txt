add_subdirectory(
  "${PROJECT_SOURCE_DIR}/third_party/tests"
  "${CMAKE_CURRENT_BINARY_DIR}/catch2_build"
  EXCLUDE_FROM_ALL
)

list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/third_party/tests/extras")
include(Catch)

add_executable(core_cpu_tests
  smoke_test.cpp
  ../src/internal/kmeans.cpp
  ../src/internal/image_utils.cpp
  ../src/internal/fft_iterative.cpp
  stubs/kmeans_gpu_stub.cpp
)

target_include_directories(core_cpu_tests BEFORE PRIVATE
  "${CMAKE_CURRENT_SOURCE_DIR}/stubs"
  "${PROJECT_SOURCE_DIR}/core/include"
  "${PROJECT_SOURCE_DIR}/core/src"
)

target_compile_options(core_cpu_tests PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})
target_link_libraries(core_cpu_tests PRIVATE Catch2::Catch2WithMain)

catch_discover_tests(core_cpu_tests DISCOVERY_MODE PRE_TEST)
