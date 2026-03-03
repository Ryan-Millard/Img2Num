# =================================================================
# Img2Num Core (C++)
# =================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE CORE_SRC
  "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

add_library(Img2Num ${CORE_SRC})

target_include_directories(Img2Num
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}/img2num>
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
)

# --- Install targets for packaging ---
install(TARGETS Img2Num
  EXPORT Img2NumTargets
    LIBRARY DESTINATION  ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION  ${CMAKE_INSTALL_LIBDIR}
    INCLUDES DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/img2num
)

install(DIRECTORY include/
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/img2num
  REGEX "^.*/internal/.*" EXCLUDE
)

message(STATUS "Core library configured with ${CORE_SRC}")
