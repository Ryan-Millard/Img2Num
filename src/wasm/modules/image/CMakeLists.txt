# =============================================
# Image WASM Module - CMake Build Configuration
# Cross-platform replacement for Makefile
# Added in https://github.com/Ryan-Millard/Img2Num/pull/93/changes
# =============================================

# Get module name from directory
get_filename_component(MODULE_NAME ${CMAKE_CURRENT_SOURCE_DIR} NAME)

# Capitalize first letter for export name (e.g., "image" -> "Image")
string(SUBSTRING ${MODULE_NAME} 0 1 FIRST_LETTER)
string(TOUPPER ${FIRST_LETTER} FIRST_LETTER_UPPER)
string(SUBSTRING ${MODULE_NAME} 1 -1 REST_OF_NAME)
set(CAP_MODULE_NAME "${FIRST_LETTER_UPPER}${REST_OF_NAME}")

# Collect source files
file(GLOB_RECURSE SRC_FILES
    "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp"
)

# Output directory
set(BUILD_DIR "${CMAKE_CURRENT_SOURCE_DIR}/build")
set(OUT_JS "${BUILD_DIR}/index.js")

# Create executable target (Emscripten produces .js + .wasm)
add_executable(${MODULE_NAME}_wasm ${SRC_FILES})

# Include directories
target_include_directories(${MODULE_NAME}_wasm PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -lidbfs.js")

# Shared Emscripten options
set(COMMON_FLAGS
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s EXIT_RUNTIME=1"
    "SHELL:-s ENVIRONMENT=web,worker"
    "SHELL:-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32','UTF8ToString']"
    "SHELL:-s INITIAL_MEMORY=1024MB"
    "SHELL:-s MAXIMUM_MEMORY=2048MB"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s EXPORT_NAME=create${CAP_MODULE_NAME}Module"
)

# Apply common flags
target_compile_options(${MODULE_NAME}_wasm PRIVATE -msimd128)
target_link_options(${MODULE_NAME}_wasm PRIVATE ${COMMON_FLAGS} -msimd128)

# Build-type specific flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(${MODULE_NAME}_wasm PRIVATE -O2 -g4)
    target_link_options(${MODULE_NAME}_wasm PRIVATE
        "SHELL:-s ASSERTIONS=2"
        -g4
    )
else()
    target_compile_options(${MODULE_NAME}_wasm PRIVATE -O3)
    target_link_options(${MODULE_NAME}_wasm PRIVATE
        "SHELL:-s SINGLE_FILE=0"
    )
endif()

# Set output location and name
set_target_properties(${MODULE_NAME}_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${BUILD_DIR}"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "Module '${MODULE_NAME}' configured (export: create${CAP_MODULE_NAME}Module)")
