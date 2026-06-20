# =================================================================
# Example Console App (C)
# =================================================================
project(CImg2NumExample_console_c LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Source file
set(EXAMPLE_SRC main.c)

# Build executable
add_executable(CImg2NumExample_console_c ${EXAMPLE_SRC})

target_compile_options(CImg2NumExample_console_c PRIVATE ${IMG2NUM_STRICT_CXX_FLAGS})

# Include the downloaded headers directly
target_include_directories(CImg2NumExample_console_c PRIVATE
  ${CMAKE_SOURCE_DIR}/third_party
)

# Location to store the output images
target_compile_definitions(CImg2NumExample_console_c PRIVATE
  OUTPUT_DIR="${CMAKE_BINARY_DIR}/outputs/console-c"
)

# Link against the C bindings
target_link_libraries(CImg2NumExample_console_c PRIVATE CImg2Num m)
