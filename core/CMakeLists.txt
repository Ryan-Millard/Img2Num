# =================================================================
# Img2Num Core (C++)
# =================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE CORE_SRC
  "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

message(STATUS ${CMAKE_BINARY_DIR})

file(GLOB WGSL_SHADERS CONFIGURE_DEPENDS
    ${CMAKE_CURRENT_SOURCE_DIR}/src/internal/resources/*.wgsl
)

set(EMBEDDED_SHADERS_OUT "${CMAKE_BINARY_DIR}/embedded_shaders.h")

add_custom_target(Img2Num_shaders ALL
    COMMAND python3 ${CMAKE_CURRENT_SOURCE_DIR}/tools/embed_shaders.py
            ${CMAKE_CURRENT_SOURCE_DIR}/src/internal/resources
            ${EMBEDDED_SHADERS_OUT}
    DEPENDS 
        ${WGSL_SHADERS}
        ${CMAKE_CURRENT_SOURCE_DIR}/tools/embed_shaders.py
    VERBATIM
)

add_library(Img2Num ${CORE_SRC})

add_dependencies(Img2Num Img2Num_shaders)

target_sources(Img2Num PRIVATE ${EMBEDDED_SHADERS_OUT})

target_include_directories(Img2Num
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}/img2num>
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
    ${CMAKE_BINARY_DIR}
)

if (EMSCRIPTEN)
  message("using emdawnwebgpu port")
  target_compile_options(Img2Num PRIVATE "--use-port=emdawnwebgpu")
  target_link_options(Img2Num PRIVATE "--use-port=emdawnwebgpu" "SHELL:-s ASYNCIFY=1")
else()
  
  find_package(Dawn QUIET)
  if (Dawn_FOUND)
    message("Found system Dawn")
  else()
    message("Building Dawn from third_party")
    set(DAWN_SUPPORTS_GLFW_FOR_WINDOWING OFF CACHE BOOL "Disable GLFW support for windowing" FORCE)
    set(DAWN_USE_X11 OFF CACHE BOOL "Disable X11 support" FORCE)
    set(DAWN_FETCH_DEPENDENCIES ON)
    add_subdirectory("${CMAKE_CURRENT_SOURCE_DIR}/../third_party/dawn" "${CMAKE_CURRENT_SOURCE_DIR}/../third_party/dawn/build/" EXCLUDE_FROM_ALL)
  endif()

  # PUBLIC: only expose the directory that contains img2num.h
  # PRIVATE: internal headers
  target_include_directories(Img2Num
    PUBLIC
      $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
      $<BUILD_INTERFACE:${DAWN_INCLUDE_DIR}>
    PRIVATE
      ${CMAKE_CURRENT_SOURCE_DIR}/include/internal
  )

  target_link_libraries(Img2Num PRIVATE $<BUILD_INTERFACE:webgpu_dawn>)
endif()

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
