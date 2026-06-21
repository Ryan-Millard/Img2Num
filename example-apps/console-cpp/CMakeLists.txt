# =================================================================
# Example Console App (C++)
# =================================================================
project(Img2NumExample_console_cpp LANGUAGES CXX)

# Collect source files
file(GLOB_RECURSE EXAMPLE_SRC "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp")

# Build executable
add_executable(Img2NumExample_console_cpp ${EXAMPLE_SRC})

target_compile_options(Img2NumExample_console_cpp PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})

# Include the downloaded STB headers
target_include_directories(Img2NumExample_console_cpp PRIVATE
  ${CMAKE_SOURCE_DIR}/third_party
)

# Location to store the output images
target_compile_definitions(Img2NumExample_console_cpp PRIVATE
  OUTPUT_DIR="${CMAKE_BINARY_DIR}/outputs/console-cpp"
)

# Link against the core Img2Num library
target_link_libraries(Img2NumExample_console_cpp PRIVATE Img2Num)
