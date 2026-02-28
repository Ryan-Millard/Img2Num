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
