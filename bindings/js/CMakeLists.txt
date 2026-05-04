cmake_minimum_required(VERSION 3.16)
project(JSBindings LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "Emscripten is required to build JS bindings.")
endif()

file(GLOB_RECURSE BINDING_SRC CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")

add_executable(img2num_wasm ${BINDING_SRC})

target_link_libraries(img2num_wasm PRIVATE CImg2Num)

target_include_directories(img2num_wasm PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

# Emscripten options
set(COMMON_FLAGS
    "SHELL:-sMODULARIZE=1"
    "SHELL:-sEXPORT_ES6=1"
    "SHELL:-sENVIRONMENT=web,worker"
    "SHELL:-sEXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32','UTF8ToString','stringToUTF8','lengthBytesUTF8']"
    "SHELL:-sINITIAL_MEMORY=2GB"
    "SHELL:-sMAXIMUM_MEMORY=4GB"
    "SHELL:-sASYNCIFY_STACK_SIZE=131272" # in bytes
    "SHELL:-sALLOW_MEMORY_GROWTH=1"
    "SHELL:-sEXPORT_NAME=createImg2NumModule"
    "SHELL:-sASYNCIFY=1"
    "SHELL:-sSTACK_OVERFLOW_CHECK=1"
    "SHELL:-sABORTING_MALLOC=0"
    "SHELL:-sNO_DISABLE_EXCEPTION_CATCHING"
    "SHELL:--use-port=emdawnwebgpu"
)

target_compile_options(img2num_wasm PRIVATE -msimd128 -fexceptions)

target_link_options(img2num_wasm PRIVATE ${COMMON_FLAGS} -msimd128)

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(img2num_wasm PRIVATE -O0 -gsource-map -fsanitize=alignment)
    target_link_options(img2num_wasm PRIVATE -gsource-map -fsanitize=alignment "SHELL:-sASSERTIONS=2")
else()
    # -Oz: smallest size. This is critical for websites as WASM is loaded almost every time
    target_compile_options(img2num_wasm PRIVATE -Oz)
    target_link_options(img2num_wasm PRIVATE "SHELL:-sSINGLE_FILE=0")
endif()

set_target_properties(img2num_wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/packages/js/build-wasm"
    OUTPUT_NAME "index"
    SUFFIX ".js"
)

message(STATUS "WASM module configured: img2num_wasm")
message(STATUS "Build output directory: ${CMAKE_SOURCE_DIR}/packages/js/build-wasm")
message(STATUS "Generated JS file: ${CMAKE_SOURCE_DIR}/packages/js/build-wasm/index.js")
