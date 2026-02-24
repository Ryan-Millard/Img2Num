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
          ${CMAKE_CURRENT_SOURCE_DIR}/include
      PRIVATE
          ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
  )

    target_compile_options(core_obj PRIVATE -msimd128 "--use-port=emdawnwebgpu")
    target_link_options(core_obj PRIVATE -msimd128 "--use-port=emdawnwebgpu")
else()
  # Build a regular shared library
  add_library(Img2Num SHARED ${CORE_SRC})

  # PUBLIC: only expose the directory that contains img2num.h
  # PRIVATE: internal headers
  target_include_directories(Img2Num
    PUBLIC
      $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    PRIVATE
      ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
  )

  # --- Install targets for packaging ---
  install(TARGETS Img2Num
    EXPORT Img2NumTargets
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    INCLUDES DESTINATION include
  )
endif()

message(STATUS "Core library configured with ${CORE_SRC}")
