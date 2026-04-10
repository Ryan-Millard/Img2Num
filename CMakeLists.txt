# =================================================================
# Img2Num Top-Level (Manages all libs and apps)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2Num LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

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
  add_subdirectory(bindings/python)
  
  if(IMG2NUM_BUILD_EXAMPLES)
    # Example console app (C++)
    add_subdirectory(example-apps/console-cpp)
    # Example console app (C)
    add_subdirectory(example-apps/console-c)
  endif()
endif()

# --- Install export for package ---
include(GNUInstallDirs)

install(EXPORT Img2NumTargets
  FILE Img2NumTargets.cmake
  NAMESPACE Img2Num::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Img2Num
)

include(CMakePackageConfigHelpers)

write_basic_package_version_file(
  "${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfigVersion.cmake"
    VERSION 0.0.0
    COMPATIBILITY SameMajorVersion
)

configure_package_config_file(
  ${CMAKE_CURRENT_SOURCE_DIR}/cmake/Img2NumConfig.cmake.in
  ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
  INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Img2Num
)

install(FILES
  ${CMAKE_CURRENT_BINARY_DIR}/Img2NumConfig.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Img2Num
)
