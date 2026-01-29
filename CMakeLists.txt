# =================================================================
# Img2Num Top-Level
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2Num LANGUAGES CXX)

# ---------------------------
# Build options
# ---------------------------
option(BUILD_NATIVE "Build native shared library" ON)
option(BUILD_PYTHON "Build Python bindings" OFF)
option(BUILD_WASM "Build JS/WASM bindings" OFF)

# ---------------------------
# Core library
# ---------------------------
add_subdirectory(core)

# ---------------------------
# Build targets
# ---------------------------
if(BUILD_NATIVE)
    message(STATUS "Building native shared library...")
    add_library(img2num_native ALIAS img2num_core)
endif()

if(BUILD_PYTHON)
    message(STATUS "Building Python bindings...")
    add_subdirectory(bindings/py)
endif()

if(BUILD_WASM)
    message(STATUS "Building JS/WASM bindings...")
    add_subdirectory(bindings/js)
endif()
