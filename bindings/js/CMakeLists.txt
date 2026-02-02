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

target_compile_options(img2num_wasm PRIVATE
    "-sMODULARIZE=1"
    "-sEXPORT_ES6=1"
    "-sEXIT_RUNTIME=1"
    "-sENVIRONMENT=web,worker"
    "-sEXPORTED_FUNCTIONS=['_malloc','_free']"
    "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32']"
    "-sINITIAL_MEMORY=1024MB"
    "-sMAXIMUM_MEMORY=2048MB"
    "-sALLOW_MEMORY_GROWTH=1"
    "-sEXPORT_NAME=createImg2NumModule"
    "-sUSE_PTHREADS=1"
    "-sPTHREAD_POOL_SIZE=8"
    "-sSINGLE_FILE=1"
)

# Output
set_target_properties(img2num_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/build"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "WASM build configured: index.js + index.wasm")
