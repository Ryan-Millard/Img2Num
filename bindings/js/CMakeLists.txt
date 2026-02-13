# =================================================================
# JS/WASM binding using core object library
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(JSBindings LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Must be built with Emscripten
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "Emscripten is required to build JS bindings.")
endif()

# Collect binding sources
file(GLOB_RECURSE BINDING_SRC "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")
file(GLOB_RECURSE BINDING_HEADERS "${CMAKE_CURRENT_SOURCE_DIR}/include/*.h")

# Build WASM module
add_executable(img2num_wasm ${BINDING_SRC})

# Link core library object files
target_link_libraries(img2num_wasm PRIVATE core)

# Include directories
target_include_directories(img2num_wasm PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Emscripten options
set(COMMON_FLAGS
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s ENVIRONMENT=web,worker"
    "SHELL:-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32','UTF8ToString','stringToUTF8','lengthBytesUTF8']"
    "SHELL:-s INITIAL_MEMORY=128MB"
    "SHELL:-s MAXIMUM_MEMORY=2048MB"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s EXPORT_NAME=createImg2NumModule"
)

target_compile_options(img2num_wasm PRIVATE -msimd128)
target_link_options(img2num_wasm PRIVATE ${COMMON_FLAGS} -msimd128)

# Build type flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(img2num_wasm PRIVATE -O2 -g4)
    target_link_options(img2num_wasm PRIVATE "SHELL:-s ASSERTIONS=2" -g4)
else()
    target_compile_options(img2num_wasm PRIVATE -O3)
    target_link_options(img2num_wasm PRIVATE "SHELL:-s SINGLE_FILE=0")
endif()

# Output location
set_target_properties(img2num_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/packages/js/build-wasm"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "WASM module configured: img2num_wasm")
