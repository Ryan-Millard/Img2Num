# =================================================================
# WASM Root Orchestrator - CMake Build System
# Cross-platform replacement for Makefile
# Added in https://github.com/Ryan-Millard/Img2Num/pull/93/changes
# =================================================================

cmake_minimum_required(VERSION 3.16)
project(Img2NumWASM LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Verify we're building with Emscripten
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR
        "This project must be built with Emscripten.\n"
        "Use: emcmake cmake .. && cmake --build .\n"
        "See docs for installation: https://emscripten.org/docs/getting_started/"
    )
endif()

# Build type defaults to Release
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Emscripten: ${EMSCRIPTEN_ROOT_PATH}")

# Auto-discover all modules with CMakeLists.txt
file(GLOB MODULE_DIRS "${CMAKE_CURRENT_SOURCE_DIR}/modules/*")
foreach(MODULE_DIR ${MODULE_DIRS})
    if(IS_DIRECTORY ${MODULE_DIR} AND EXISTS "${MODULE_DIR}/CMakeLists.txt")
        get_filename_component(MODULE_NAME ${MODULE_DIR} NAME)
        message(STATUS "Adding module: ${MODULE_NAME}")
        add_subdirectory(${MODULE_DIR})
    endif()
endforeach()

