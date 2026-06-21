# =================================================================
# Img2Num Top-Level (Manages all libs and apps)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2NumRootManager LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Ensure we strictly conform to the C++17 standard
# This is important for inter-OS reproducibility
set(CMAKE_CXX_EXTENSIONS OFF)

# Reusable flags to ensure good quality code
set(IMG2NUM_STRICT_CXX_FLAGS
    $<$<AND:$<COMPILE_LANGUAGE:CXX>,$<OR:$<CXX_COMPILER_ID:GNU>,$<CXX_COMPILER_ID:Clang>,$<CXX_COMPILER_ID:AppleClang>>>:-Wpedantic -Werror=pedantic -Werror=c++20-extensions>
    $<$<AND:$<COMPILE_LANGUAGE:CXX>,$<CXX_COMPILER_ID:MSVC>>:/permissive->
)

option(BUILD_PYTHON "Build Python bindings" OFF)
option(IMG2NUM_BUILD_EXAMPLES "Build example applications" ON)

# Force a safe default to avoid the weirdness of CMake's `None`
if(NOT CMAKE_BUILD_TYPE OR CMAKE_BUILD_TYPE STREQUAL "")
  message(STATUS "CMAKE_BUILD_TYPE unspecified - defaulting to \"Release\"")
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Choose the type of build" FORCE)
endif()

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")

# Core library
add_subdirectory(core)

# C bindings
add_subdirectory(bindings/c)

if(EMSCRIPTEN)
  # JS bindings
  add_subdirectory(bindings/js)
else()
  # Python bindings
  if(BUILD_PYTHON)
    add_subdirectory(bindings/py)
  endif()
  
  if(IMG2NUM_BUILD_EXAMPLES)
    # Example console app (C++)
    add_subdirectory(example-apps/console-cpp)
    # Example console app (C)
    add_subdirectory(example-apps/console-c)
  endif()
endif()
