add_subdirectory(
  "${PROJECT_SOURCE_DIR}/third_party/tests"
  "${CMAKE_CURRENT_BINARY_DIR}/catch2_build"
  EXCLUDE_FROM_ALL
)

list(APPEND CMAKE_MODULE_PATH "${PROJECT_SOURCE_DIR}/third_party/tests/extras")
include(Catch)

add_executable(core_cpu_tests
  smoke_test.cpp
)

target_include_directories(core_cpu_tests BEFORE PRIVATE
  "${PROJECT_SOURCE_DIR}/core/include"
  "${PROJECT_SOURCE_DIR}/core/src"
)

target_compile_options(core_cpu_tests PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})
target_link_libraries(core_cpu_tests PUBLIC Img2Num)
target_link_libraries(core_cpu_tests PRIVATE Catch2::Catch2WithMain spdlog::spdlog_header_only)

catch_discover_tests(core_cpu_tests DISCOVERY_MODE PRE_TEST)

# Register the GPU-free lookup regression in the existing core test build.
add_executable(gpu_shader_lookup_test
  gpu_shader_lookup_test.cpp
  "${PROJECT_SOURCE_DIR}/bindings/c/src/cimg2num/img2num_error_t.cpp"
)
add_dependencies(gpu_shader_lookup_test Img2Num_shaders)
target_include_directories(gpu_shader_lookup_test PRIVATE
  "${CMAKE_BINARY_DIR}"
  "${PROJECT_SOURCE_DIR}/bindings/c/include"
)
target_link_libraries(gpu_shader_lookup_test PRIVATE Img2Num spdlog::spdlog_header_only)
if(TARGET webgpu_dawn)
  target_link_libraries(gpu_shader_lookup_test PRIVATE webgpu_dawn)
else()
  find_package(Threads REQUIRED)
  find_package(Dawn REQUIRED)
  target_link_libraries(gpu_shader_lookup_test PRIVATE dawn::webgpu_dawn)
endif()
target_compile_options(gpu_shader_lookup_test PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})
target_compile_definitions(gpu_shader_lookup_test PRIVATE
  IMG2NUM_TEST_C_BINDINGS
  $<TARGET_PROPERTY:Img2Num,COMPILE_DEFINITIONS>
)

add_test(NAME gpu_shader_lookup COMMAND gpu_shader_lookup_test)
