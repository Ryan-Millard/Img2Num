# =================================================================
# JS/WASM binding using core object library
# =================================================================
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "WASM build requires Emscripten")
endif()

add_executable(img2num_wasm
    src/wasm_wrapper.cpp
    $<TARGET_OBJECTS:img2num_core>
)

# Include core headers
target_include_directories(img2num_wasm PRIVATE "${CMAKE_SOURCE_DIR}/core/include")

# Linker flags
set(WASM_LINK_FLAGS
    "-s MODULARIZE=1"
    "-s EXPORT_ES6=1"
    "-s EXIT_RUNTIME=1"
    "-s ENVIRONMENT=web,worker"
    "-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32']"
    "-s INITIAL_MEMORY=1024MB"
    "-s MAXIMUM_MEMORY=2048MB"
    "-s ALLOW_MEMORY_GROWTH=1"
    "-s USE_PTHREADS=1"
    "-s PTHREAD_POOL_SIZE=8"
)

target_link_options(img2num_wasm PRIVATE ${WASM_LINK_FLAGS})

# Output
set_target_properties(img2num_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/build"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "WASM build configured: index.js + index.wasm")
