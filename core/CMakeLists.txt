# =================================================================
# Img2Num Core (Object Library)
# =================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# =========================
# Source files
# =========================
file(GLOB CORE_SRC "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")

# =========================
# Core as object library
# =========================
add_library(img2num_core OBJECT ${CORE_SRC})
target_include_directories(img2num_core PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include")

# =========================
# Compiler flags
# =========================
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(img2num_core PRIVATE -O2 -g)
else()
    target_compile_options(img2num_core PRIVATE -O3)
endif()

# =========================
# WASM-specific flags
# =========================
if(EMSCRIPTEN)
    target_compile_options(img2num_core PRIVATE -pthread -msimd128)
endif()
