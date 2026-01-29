# =================================================================
# Img2Num WASM Library
# =================================================================

cmake_minimum_required(VERSION 3.16)
project(Img2NumWASM LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Verify Emscripten
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR
        "This project must be built with Emscripten.\n"
        "Use: emcmake cmake .. && cmake --build ."
        "See their docs for installation: https://emscripten.org/docs/getting_started/"
    )
endif()

# Default build type
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()
message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")

# =========================
# Source files
# =========================
file(GLOB SRC_FILES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

# Include directories
include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

# =========================
# WASM executable target
# =========================
add_executable(img2num_wasm ${SRC_FILES})

# =========================
# Compiler flags
# =========================
target_compile_options(img2num_wasm PRIVATE
    -pthread
    -msimd128
)

# Build type specific compiler flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(img2num_wasm PRIVATE -O2 -g4)
else()
    target_compile_options(img2num_wasm PRIVATE -O3)
endif()

# =========================
# Linker flags (Emscripten-specific)
# =========================
set(WASM_LINK_FLAGS
    "-s MODULARIZE=1"
    "-s EXPORT_ES6=1"
    "-s EXIT_RUNTIME=1"
    "-s ENVIRONMENT=web,worker"
    "-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32']"
    "-s INITIAL_MEMORY=1024MB"
    "-s MAXIMUM_MEMORY=2048MB"
    "-s ALLOW_MEMORY_GROWTH=1"
    "-s USE_PTHREADS=1"
    "-s PTHREAD_POOL_SIZE=8"
)

target_link_options(img2num_wasm PRIVATE ${WASM_LINK_FLAGS})

# Build type specific linker flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_link_options(img2num_wasm PRIVATE -g4 -s ASSERTIONS=2)
else()
    target_link_options(img2num_wasm PRIVATE -s SINGLE_FILE=0)
endif()

# =========================
# Output settings
# =========================
set_target_properties(img2num_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/build"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "WASM library configured: index.js + index.wasm")
