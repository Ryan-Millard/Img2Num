add_executable(gpu_shader_lookup_test gpu_shader_lookup_test.cpp)
add_dependencies(gpu_shader_lookup_test Img2Num_shaders)
target_include_directories(gpu_shader_lookup_test PRIVATE "${CMAKE_BINARY_DIR}")
target_link_libraries(gpu_shader_lookup_test PRIVATE Img2Num spdlog::spdlog_header_only)
# Installed Dawn targets imported in core's directory are not visible here.
if(TARGET webgpu_dawn)
  target_link_libraries(gpu_shader_lookup_test PRIVATE webgpu_dawn)
else()
  find_package(Threads REQUIRED)
  find_package(Dawn REQUIRED)
  target_link_libraries(gpu_shader_lookup_test PRIVATE dawn::webgpu_dawn)
endif()
target_compile_options(gpu_shader_lookup_test PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})
target_compile_definitions(gpu_shader_lookup_test PRIVATE
  $<TARGET_PROPERTY:Img2Num,COMPILE_DEFINITIONS>
)

if(TARGET CImg2Num)
  target_link_libraries(gpu_shader_lookup_test PRIVATE CImg2Num)
  target_compile_definitions(gpu_shader_lookup_test PRIVATE IMG2NUM_TEST_C_BINDINGS)
endif()

add_test(NAME gpu_shader_lookup COMMAND gpu_shader_lookup_test)
