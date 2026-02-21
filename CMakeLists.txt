# =================================================================
# Img2Num Top-Level
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2Num LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Default build type
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

# Core library
add_subdirectory(core)

if(EMSCRIPTEN)
  # JS bindings
  add_subdirectory(bindings/js)
else()
  # C bindings
  add_subdirectory(bindings/c)

  # --- Download stb_image.h and stb_image_write.h ---
  include(FetchContent)
  file(DOWNLOAD 
    "https://raw.githubusercontent.com/nothings/stb/master/stb_image.h"
    "${CMAKE_BINARY_DIR}/stb/stb_image.h"
  )
  file(DOWNLOAD 
    "https://raw.githubusercontent.com/nothings/stb/master/stb_image_write.h"
    "${CMAKE_BINARY_DIR}/stb/stb_image_write.h"
  )

  # Example console app (C++)
  add_subdirectory(example-apps/console-cpp)
  # Example console app (C)
  add_subdirectory(example-apps/console-c)

  # --- Install export for package ---
  install(EXPORT Img2NumTargets
    FILE Img2NumTargets.cmake
    NAMESPACE Img2Num::
    DESTINATION lib/cmake/Img2Num
  )

  include(CMakePackageConfigHelpers)

  configure_package_config_file(
      ${CMAKE_CURRENT_SOURCE_DIR}/cmake/Img2NumConfig.cmake.in
      ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
      INSTALL_DESTINATION lib/cmake/Img2Num
  )

  install(FILES
      ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
      DESTINATION lib/cmake/Img2Num
  )
endif()
