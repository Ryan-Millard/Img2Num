cmake_minimum_required(VERSION 3.16)
project(JSBindings LANGUAGES C)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)

if(NOT EMSCRIPTEN)
    message(FATAL_ERROR "Emscripten is required to build JS bindings.")
endif()

# Base64-inline the wasm into the UMD/IIFE glue. Costs ~33% over the wire and
# gives up instantiateStreaming, but makes the <script>-tag build a single file
# with no path resolution. Turn OFF if the binary is large (see notes below).
option(IMG2NUM_WASM_SINGLE_FILE "Inline the wasm into the standalone (UMD/IIFE) glue" ON)

file(GLOB_RECURSE BINDING_SRC CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.c")

set(WASM_OUT_DIR "${CMAKE_SOURCE_DIR}/packages/js/build-wasm")

# Flags shared by every variant. Everything that differs between variants
# (ENVIRONMENT / EXPORT_ES6 / SINGLE_FILE) is applied per-target below.
set(IMG2NUM_WASM_BASE_LINK_FLAGS
    "SHELL:-sMODULARIZE=1"
    "SHELL:-sEXPORT_NAME=createImg2NumModule"
    "SHELL:-sEXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8','HEAP32','UTF8ToString','stringToUTF8','lengthBytesUTF8']"
    "SHELL:-sALLOW_MEMORY_GROWTH=1"
    "SHELL:-sINITIAL_MEMORY=32MB"
    "SHELL:-sMAXIMUM_MEMORY=4GB"
    "SHELL:-sASYNCIFY=1"
    "SHELL:-sASYNCIFY_STACK_SIZE=131272"   # bytes
    "SHELL:-sABORTING_MALLOC=0"
    "SHELL:-sNO_DISABLE_EXCEPTION_CATCHING"
    "SHELL:--use-port=emdawnwebgpu"
    "SHELL:-sFILESYSTEM=0"
)

# img2num_add_wasm_variant(<target>
#     ENVIRONMENT  "web,worker" | "node"
#     ES6          0 | 1
#     SINGLE_FILE  0 | 1
#     SUBDIR       web | standalone | node)
function(img2num_add_wasm_variant TARGET_NAME)
    cmake_parse_arguments(V "" "ENVIRONMENT;ES6;SINGLE_FILE;SUBDIR" "" ${ARGN})

    add_executable(${TARGET_NAME} ${BINDING_SRC})

    target_link_libraries(${TARGET_NAME} PRIVATE CImg2Num)
    target_include_directories(${TARGET_NAME} PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/include")

    target_compile_options(${TARGET_NAME} PRIVATE -msimd128 -fexceptions)

    target_link_options(${TARGET_NAME} PRIVATE
        ${IMG2NUM_WASM_BASE_LINK_FLAGS}
        -msimd128
        -fexceptions
        "SHELL:-sENVIRONMENT=${V_ENVIRONMENT}"
        "SHELL:-sEXPORT_ES6=${V_ES6}"
        "SHELL:-sSINGLE_FILE=${V_SINGLE_FILE}"
    )

    if(CMAKE_BUILD_TYPE STREQUAL "Debug")
        target_compile_options(${TARGET_NAME} PRIVATE
            -O0 -g -fsanitize=alignment)
        target_link_options(${TARGET_NAME} PRIVATE
            -g -fsanitize=alignment
            "SHELL:-sASSERTIONS=2"
            "SHELL:-sSTACK_OVERFLOW_CHECK=1")
    else()
        # -Oz: smallest size. Critical for the browser, where the wasm is
        # fetched on nearly every page load.
        target_compile_options(${TARGET_NAME} PRIVATE -Oz)
    endif()

    set_target_properties(${TARGET_NAME} PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${WASM_OUT_DIR}/${V_SUBDIR}"
        OUTPUT_NAME "img2num"
        SUFFIX ".js"
    )

    message(STATUS
        "WASM variant ${TARGET_NAME}: env=${V_ENVIRONMENT} es6=${V_ES6} "
        "single_file=${V_SINGLE_FILE} -> ${WASM_OUT_DIR}/${V_SUBDIR}/img2num.js")
endfunction()

if(IMG2NUM_WASM_SINGLE_FILE)
    set(_STANDALONE_SINGLE_FILE 1)
else()
    set(_STANDALONE_SINGLE_FILE 0)
endif()

# ESM consumers behind a bundler. External .wasm so it can be cached and
# relocated by the host app's asset pipeline.
img2num_add_wasm_variant(img2num_wasm_web
    ENVIRONMENT "web,worker" ES6 1 SINGLE_FILE 0 SUBDIR web)

# <script>-tag consumers. Non-ES6 so the glue has no top-level await and no
# import.meta — the two things Rollup cannot place in a UMD or IIFE chunk.
img2num_add_wasm_variant(img2num_wasm_standalone
    ENVIRONMENT "web,worker" ES6 0 SINGLE_FILE ${_STANDALONE_SINGLE_FILE}
    SUBDIR standalone)

# Node. Separate build so the web glue carries no fs/path branches and the
# node glue carries no XHR branches.
img2num_add_wasm_variant(img2num_wasm_node
    ENVIRONMENT "node" ES6 0 SINGLE_FILE 0 SUBDIR node)

add_custom_target(img2num_wasm_all
    DEPENDS img2num_wasm_web img2num_wasm_standalone img2num_wasm_node)
