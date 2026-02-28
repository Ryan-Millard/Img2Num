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

add_library(Img2Num ${CORE_SRC})

target_include_directories(Img2Num
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include/img2num>
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
)

# --- Install targets for packaging ---
install(TARGETS Img2Num
  EXPORT Img2NumTargets
  LIBRARY DESTINATION lib
  ARCHIVE DESTINATION lib
  INCLUDES DESTINATION include/img2num
)

install(DIRECTORY include/
        DESTINATION include/img2num
        EXCLUDE_FROM_ALL
        REGEX "^.*/internal/.*" EXCLUDE
)

message(STATUS "Core library configured with ${CORE_SRC}")
