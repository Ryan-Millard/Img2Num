# =================================================================
# Img2Num C Bindings
# =================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CIMG2NUM_VERSION 0.0.0)

include(CMakePackageConfigHelpers)
include(GNUInstallDirs)

# Wrapper source
set(C_BINDINGS_SRC
    src/cimg2num.cpp
    src/cimg2num/img2num_error_t.cpp
)

add_library(CImg2Num ${C_BINDINGS_SRC})

set_target_properties(CImg2Num PROPERTIES
  VERSION ${CIMG2NUM_VERSION}
  SOVERSION 1
)

# Link against the core C++ library
target_link_libraries(CImg2Num PUBLIC Img2Num)

target_include_directories(CImg2Num
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}/cimg2num>
)

# Install headers and library
write_basic_package_version_file(
  "${CMAKE_CURRENT_BINARY_DIR}/CImg2NumConfigVersion.cmake"
  VERSION ${CIMG2NUM_VERSION}
  COMPATIBILITY SameMajorVersion
)

configure_package_config_file(
  ${CMAKE_CURRENT_SOURCE_DIR}/cmake/CImg2NumConfig.cmake.in
  ${CMAKE_CURRENT_BINARY_DIR}/CImg2NumConfig.cmake
  INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CImg2Num
)

install(FILES
  ${CMAKE_CURRENT_BINARY_DIR}/CImg2NumConfig.cmake
  ${CMAKE_CURRENT_BINARY_DIR}/CImg2NumConfigVersion.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CImg2Num
)

install(TARGETS CImg2Num
  EXPORT CImg2NumTargets
    LIBRARY DESTINATION  ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION  ${CMAKE_INSTALL_LIBDIR}
    INCLUDES DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/cimg2num
)

install(EXPORT CImg2NumTargets
  FILE CImg2NumTargets.cmake
  NAMESPACE CImg2Num::
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/CImg2Num
)

install(DIRECTORY include/
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/cimg2num
)

message(STATUS "C bindings library configured with ${C_BINDINGS_SRC}")
