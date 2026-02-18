# =================================================================
# Example Console App (C)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2NumExample LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Source file
set(EXAMPLE_SRC main.c)

# Build executable
add_executable(console_c_app ${EXAMPLE_SRC})

# Link against the C bindings
target_link_libraries(console_c_app PRIVATE CImg2Num m)
