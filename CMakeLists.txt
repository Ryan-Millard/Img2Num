# =================================================================
# Img2Num Top-Level
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2Num LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

option(IMG2NUM_BUILD_EXAMPLES "Build example applications" ON)

# Core library
add_subdirectory(core)

# C bindings
add_subdirectory(bindings/c)

if(EMSCRIPTEN)
  # JS bindings
  add_subdirectory(bindings/js)
else()
  if(IMG2NUM_BUILD_EXAMPLES)
    # --- Download stb_image.h and stb_image_write.h ---
    # Pin stb to a known commit for reproducible builds
    set(STB_COMMIT "f1c79c02822848a9bed4315b12c8c8f3761e1296")  # Update as needed
    file(DOWNLOAD
      "https://raw.githubusercontent.com/nothings/stb/${STB_COMMIT}/stb_image.h"
      "${CMAKE_BINARY_DIR}/stb/stb_image.h"
      STATUS STB_IMAGE_STATUS
    )
    list(GET STB_IMAGE_STATUS 0 STB_IMAGE_RC)
    if(NOT STB_IMAGE_RC EQUAL 0)
      message(FATAL_ERROR "Failed to download stb_image.h: ${STB_IMAGE_STATUS}")
    endif()

    file(DOWNLOAD
      "https://raw.githubusercontent.com/nothings/stb/${STB_COMMIT}/stb_image_write.h"
      "${CMAKE_BINARY_DIR}/stb/stb_image_write.h"
      STATUS STB_IMAGE_WRITE_STATUS
    )
    list(GET STB_IMAGE_WRITE_STATUS 0 STB_IMAGE_WRITE_RC)
    if(NOT STB_IMAGE_WRITE_RC EQUAL 0)
      message(FATAL_ERROR "Failed to download stb_image_write.h: ${STB_IMAGE_WRITE_STATUS}")
    endif()

    # Example console app (C++)
    add_subdirectory(example-apps/console-cpp)
    # Example console app (C)
    add_subdirectory(example-apps/console-c)
  endif()
endif()

# --- Install export for package ---
install(EXPORT Img2NumTargets
  FILE Img2NumTargets.cmake
  NAMESPACE Img2Num::
  DESTINATION lib/cmake/Img2Num
)

include(CMakePackageConfigHelpers)

write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/my_libConfigVersion.cmake"
    VERSION 0.0.0
    COMPATIBILITY SameMajorVersion
)

configure_package_config_file(
  ${CMAKE_CURRENT_SOURCE_DIR}/cmake/Img2NumConfig.cmake.in
  ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
  INSTALL_DESTINATION lib/cmake/Img2Num
)

install(FILES
  ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
  DESTINATION lib/cmake/Img2Num
)
