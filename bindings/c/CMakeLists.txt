# =================================================================
# Img2Num C Bindings (Shared Library)
# =================================================================
cmake_minimum_required(VERSION 3.16)

project(CImg2NumBindings LANGUAGES C CXX)

# Wrapper source
set(C_BINDINGS_SRC
    src/cimg2num.cpp
    src/cimg2num/img2num_error_t.cpp
)

add_library(CImg2Num ${C_BINDINGS_SRC})

# Link against the core C++ library
target_link_libraries(CImg2Num PRIVATE Img2Num)

target_include_directories(CImg2Num
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include/cimg2num>
)

# Install headers and library
install(TARGETS CImg2Num
    EXPORT Img2NumTargets
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        INCLUDES DESTINATION include/cimg2num
)

install(DIRECTORY include/
        DESTINATION include/cimg2num
)

message(STATUS "C bindings library configured with ${C_BINDINGS_SRC}")
