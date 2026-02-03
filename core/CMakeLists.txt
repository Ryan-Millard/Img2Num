# =================================================================
# Img2Num Core (Object Library)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(CoreLibrary LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Collect sources
file(GLOB_RECURSE CORE_SRC "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
file(GLOB_RECURSE CORE_HEADERS "${CMAKE_CURRENT_SOURCE_DIR}/include/*.h")

# Build as object library
add_library(core OBJECT ${CORE_SRC} ${CORE_HEADERS})

target_include_directories(core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# If building with Emscripten and pthreads
if(EMSCRIPTEN)
    target_compile_options(core PRIVATE -pthread -msimd128)
    target_link_options(core PRIVATE -pthread -msimd128)
endif()

message(STATUS "Core library configured with ${CORE_SRC}")
