# =================================================================
# Img2Num C Bindings
# =================================================================
# Wrapper source
set(C_BINDINGS_SRC
    src/cimg2num.cpp
    src/cimg2num/img2num_error_t.cpp
)

add_library(CImg2Num ${C_BINDINGS_SRC})

file(GLOB_RECURSE SHADER_FILES
  "../../core/src/resources/*.wgsl"
)

foreach (file ${SHADER_FILES})
get_filename_component(file_name ${file} NAME)
message(${file_name})
configure_file(${file} ./resources/${file_name} COPYONLY)
endforeach()

# Link against the core C++ library
target_link_libraries(CImg2Num PRIVATE Img2Num)

target_include_directories(CImg2Num
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}/cimg2num>
)

# Install headers and library
install(TARGETS CImg2Num
    EXPORT Img2NumTargets
      LIBRARY DESTINATION  ${CMAKE_INSTALL_LIBDIR}
      ARCHIVE DESTINATION  ${CMAKE_INSTALL_LIBDIR}
      INCLUDES DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/cimg2num
)

install(DIRECTORY include/
  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/cimg2num
)

message(STATUS "C bindings library configured with ${C_BINDINGS_SRC}")
