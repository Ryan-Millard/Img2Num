# =================================================================
# Img2Num Core (Shared Library)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(CoreLibrary LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE CORE_SRC
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

if(EMSCRIPTEN)
  # Build object library
  add_library(core_obj OBJECT ${CORE_SRC})

  # PUBLIC: only expose the directory that contains img2num.h
  # PRIVATE: internal headers
  target_include_directories(core_obj
      PUBLIC
          ${CMAKE_CURRENT_SOURCE_DIR}          # img2num.h
      PRIVATE
          ${CMAKE_CURRENT_SOURCE_DIR}/include  # internal headers
  )

    target_compile_options(core_obj PRIVATE -msimd128)
    target_link_options(core_obj PRIVATE -msimd128)
else()
  # Build a regular shared library
  add_library(core_shared SHARED ${CORE_SRC})

  # PUBLIC: only expose the directory that contains img2num.h
  # PRIVATE: internal headers
  target_include_directories(core_shared
      PUBLIC
          ${CMAKE_CURRENT_SOURCE_DIR}          # img2num.h
      PRIVATE
          ${CMAKE_CURRENT_SOURCE_DIR}/include  # internal headers
  )
endif()

message(STATUS "Core library configured with ${CORE_SRC}")
