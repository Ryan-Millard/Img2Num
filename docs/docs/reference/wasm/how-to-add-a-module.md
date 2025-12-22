---
id: wasm-add-module
title: Adding a new WASM module
sidebar_position: 6
---

# Step-by-step: add a new module

1. Create a new directory: `src/wasm/modules/<module-name>/`.
    - Replace `<module-name>` with your actual module name (lowercase, e.g., `audio`, `filters`).
2. Add `src/`, `include/` directories and a `CMakeLists.txt` file.
3. Make sure the module's `CMakeLists.txt` writes output to `build/` with `index.js` and `index.wasm` (the repo's alias generator expects `modules/{name}/build`).
4. `vite.config.js` will automatically find the module and create an alias `@wasm-<module-name>` on next `vite` start (or rebuild of the config). Example usage:

    ```js
    import init from '@wasm-<module-name>/index.js';
    await init();
    ```

5. Commit the `CMakeLists.txt` and source files; do not commit `build/` artifacts unless you want to vendor the WASM for static hosting without building.

# Minimal module CMakeLists.txt (copy/paste)

```cmake
# =============================================
# <Module Name> WASM Module - CMake Build Configuration
# =============================================

# Get module name from directory
get_filename_component(MODULE_NAME ${CMAKE_CURRENT_SOURCE_DIR} NAME)

# Capitalize first letter for export name (e.g., "audio" -> "Audio")
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

# Create executable target (Emscripten produces .js + .wasm)
add_executable(${MODULE_NAME}_wasm ${SRC_FILES})

# Include directories
target_include_directories(${MODULE_NAME}_wasm PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# Shared Emscripten options
# Adjust INITIAL_MEMORY and MAXIMUM_MEMORY based on your module's needs
set(COMMON_FLAGS
    "SHELL:-s MODULARIZE=1"
    "SHELL:-s EXPORT_ES6=1"
    "SHELL:-s EXIT_RUNTIME=1"
    "SHELL:-s ENVIRONMENT=web"
    "SHELL:-s EXPORTED_FUNCTIONS=['_malloc','_free']"
    "SHELL:-s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','getValue','setValue','HEAPU8']"
    "SHELL:-s INITIAL_MEMORY=256MB"
    "SHELL:-s MAXIMUM_MEMORY=512MB"
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

# Directory structure

Your new module should look like:

```
src/wasm/modules/<module-name>/
├── CMakeLists.txt
├── include/
│   └── your_header.h
├── src/
│   └── main.cpp
└── build/          # Generated (gitignored)
    ├── index.js
    └── index.wasm
```

# Building

Once added, the module is automatically discovered by the root `CMakeLists.txt`. Simply run:

```bash
npm run build-wasm        # Release build
npm run build-wasm:debug  # Debug build with source maps
npm run clean-wasm        # Clean all build artifacts
```

The build system works identically on Windows, macOS, and Linux.
