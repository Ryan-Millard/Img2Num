# =================================================================
# Img2Num Core (Object Library)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(CoreLibrary LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE CORE_SRC
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

add_library(core OBJECT ${CORE_SRC})

# PUBLIC: only expose the directory that contains img2num.h
# PRIVATE: internal headers
target_include_directories(core
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}          # img2num.h
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include  # internal headers
)

# Emscripten flags
if(EMSCRIPTEN)
    target_compile_options(core PRIVATE -msimd128)
    target_link_options(core PRIVATE -msimd128)
endif()

message(STATUS "Core library configured with ${CORE_SRC}")
