---
id: wasm-dev-workflow
title: Development workflow & watch behavior
sidebar_position: 4
---

# Dev server & automatic rebuilds

This repository configures a Vite plugin (`watch-cpp-and-build-wasm`) that watches `.cpp` and `.h` files and runs `npm run build-wasm` when changes occur. The plugin logic prevents overlapping builds with a `__isBuilding` flag.

Important points:

- The watcher registers `src/wasm/**/*.{cpp,h}` with Vite's watcher so edits trigger rebuilds.
- The build uses the root `src/wasm/CMakeLists.txt` which iterates through the modules and calls each module's `CMakeLists.txt`.
- For faster local iteration use `npm run dev:debug` — this runs `make debug` and launches the dev server.

## Root CMakeLists.txt contract

The root `src/wasm/CMakeLists.txt` (provided in the repo) implements two main targets, `build` & `debug`.
Submodule CMakeLists.txt must therefore support at least `build` (default) & `debug` targets.

## Example submodule CMakeLists.txt template (recommended)

```CMakeLists.txt
# =================================================================
# <ModuleName> WASM Module - CMake Build Configuration
# =================================================================

# Get module name from directory
get_filename_component(MODULE_NAME ${CMAKE_CURRENT_SOURCE_DIR} NAME)

# Capitalize first letter for export name (e.g., "example" -> "Example")
string(SUBSTRING ${MODULE_NAME} 0 1 FIRST_LETTER)
string(TOUPPER ${FIRST_LETTER} FIRST_LETTER_UPPER)
string(SUBSTRING ${MODULE_NAME} 1 -1 REST_OF_NAME)
set(CAP_MODULE_NAME "${FIRST_LETTER_UPPER}${REST_OF_NAME}")

# Collect source files (recursively)
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

# Shared Emscripten options
set(COMMON_FLAGS
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s EXIT_RUNTIME=1"
    "SHELL:-s ENVIRONMENT=web"
    "SHELL:-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8']"
    "SHELL:-s INITIAL_MEMORY=1024MB"
    "SHELL:-s MAXIMUM_MEMORY=2048MB"
    "SHELL:-s ALLOW_MEMORY_GROWTH=1"
    "SHELL:-s EXPORT_NAME=create${CAP_MODULE_NAME}Module"
)

# Apply common flags
target_link_options(${MODULE_NAME}_wasm PRIVATE ${COMMON_FLAGS})

# Build-type specific flags
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(${MODULE_NAME}_wasm PRIVATE -O0 -g4)
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
```

:::note

1. Place your C++ headers in include/ and sources in src/
2. Use exported functions via ccall/cwrap in JS
3. Adjust memory flags if your module needs more/less WASM memory
4. For module-specific Emscripten options, add them before target_link_options
   :::

This template compiles all `.cpp` files under `src/` into `build/index.js` + `build/index.wasm` using simple flags. Tailor flags and link-time options to your needs.

## Debugging tips

- Build with `debug` target to keep symbols and turn on `ASSERTIONS`.
- Use `EMSCRIPTEN_KEEP_UNWANTED_CODE` only when you need to preserve functions — avoid it in production.
- Use `console.log` in Emscripten glue JS — Emscripten prints useful warnings if symbols are missing.

---
