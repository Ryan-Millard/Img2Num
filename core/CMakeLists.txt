# =================================================================
# Img2Num Core (Dynamic Library)
# =================================================================
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# =========================
# Source files
# =========================
file(GLOB CORE_SRC
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

# =========================
# Build core as a dynamic library
# =========================
add_library(img2num_core SHARED ${CORE_SRC})
target_include_directories(img2num_core PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include")
set_target_properties(img2num_core PROPERTIES OUTPUT_NAME "img2num")

# Optional: compiler flags
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(img2num_core PRIVATE -O2 -g)
else()
    target_compile_options(img2num_core PRIVATE -O3)
endif()

# =========================
# For WASM: also provide object library
# =========================
if(EMSCRIPTEN)
    add_library(img2num_core_wasm OBJECT ${CORE_SRC})
    target_include_directories(img2num_core_wasm PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include")
    target_compile_options(img2num_core_wasm PRIVATE -pthread -msimd128)
endif()
