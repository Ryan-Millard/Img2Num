# =================================================================
# Example Console App (C++)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2NumExample LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Collect source files
file(GLOB_RECURSE EXAMPLE_SRC "${CMAKE_CURRENT_SOURCE_DIR}/*.cpp")

# Build executable
add_executable(console_cpp_app ${EXAMPLE_SRC})

# Include the downloaded STB headers
target_include_directories(console_cpp_app PRIVATE
    ${CMAKE_BINARY_DIR}
)

# Link against the core Img2Num library
target_link_libraries(console_cpp_app PRIVATE Img2Num)
