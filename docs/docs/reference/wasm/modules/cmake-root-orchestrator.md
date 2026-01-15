---
id: cmake-root-orchestrator
title: CMake Root Orchestrator
description: Cross-platform CMake build system for WebAssembly modules in Img2Num, replacing Makefiles.
sidebar_position: 2
---

# WASM Root Orchestrator - CMake Build System

This file serves as the **root CMake build orchestrator** for all WebAssembly (WASM) modules in the **Img2Num** project.  
It provides a cross-platform alternative to traditional Makefiles and integrates seamlessly with Emscripten for compiling C++ code to WASM.

It was introduced in [PR #93](https://github.com/Ryan-Millard/Img2Num/pull/93).

## Key Features

- **Cross-platform:** Works on Windows, macOS, and Linux with Emscripten.  
- **Automatic module discovery:** Detects and adds any submodule with its own `CMakeLists.txt`.  
- **Standardized build configuration:** Defaults to `C++17` and `Release` mode.  
- **Emscripten integration:** Ensures the build system is executed with Emscripten (`emcmake`).  

## Configuration

```cmake
cmake_minimum_required(VERSION 3.16)
project(Img2NumWASM LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
````

* `cmake_minimum_required(VERSION 3.16)` ensures a modern CMake version.
* `project(Img2NumWASM LANGUAGES CXX)` declares the project and specifies C++ as the language.
* `CMAKE_CXX_STANDARD 17` ensures all modules are compiled with **C++17**.
* `CMAKE_CXX_STANDARD_REQUIRED ON` enforces the C++17 standard strictly.

## Emscripten Check

```cmake
if(NOT EMSCRIPTEN)
    message(FATAL_ERROR
        "This project must be built with Emscripten.\n"
        "Use: emcmake cmake .. && cmake --build .\n"
        "See docs for installation: https://emscripten.org/docs/getting_started/"
    )
endif()
```

* Ensures the project is built with **Emscripten**.
* If not, it exits with a **fatal error** and provides instructions to the developer.
* Helps prevent accidental builds with incompatible toolchains.

## Build Type

```cmake
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Emscripten: ${EMSCRIPTEN_ROOT_PATH}")
```

* Defaults the build type to `Release` if not explicitly set.
* Prints the build type and Emscripten root path for developer visibility.
* Ensures consistent optimization levels across all modules.

## Automatic Module Discovery

```cmake
file(GLOB MODULE_DIRS "${CMAKE_CURRENT_SOURCE_DIR}/modules/*")
foreach(MODULE_DIR ${MODULE_DIRS})
    if(IS_DIRECTORY ${MODULE_DIR} AND EXISTS "${MODULE_DIR}/CMakeLists.txt")
        get_filename_component(MODULE_NAME ${MODULE_DIR} NAME)
        message(STATUS "Adding module: ${MODULE_NAME}")
        add_subdirectory(${MODULE_DIR})
    endif()
endforeach()
```

* `file(GLOB MODULE_DIRS ...)` lists all directories inside `modules/`.
* Checks each directory to see if it contains a `CMakeLists.txt`.
* If found, adds it as a **subdirectory**, effectively including the module in the build.
* Prints a status message for each module added.

This allows **plug-and-play addition of new WASM modules**:
Just create a new folder under `modules/` with its own `CMakeLists.txt`, and the root orchestrator automatically includes it.

## Usage

### Development Build

```bash
emcmake cmake ..
cmake --build .
```

* `emcmake` ensures the proper Emscripten environment is used.
* `cmake --build .` compiles all modules to WASM.

### Production Integration

* The resulting WASM files are placed in each module’s `build` folder.
* The Vite configuration automatically discovers these using aliases like `@wasm-{module}`.

## Summary

This CMake root orchestrator provides a **scalable and maintainable system** for building all WASM modules in Img2Num:

* Enforces **C++17** standard.
* Requires **Emscripten**.
* Defaults to **Release builds**.
* Automatically discovers modules.
* Integrates smoothly with the **Vite WASM workflow**.

It eliminates manual Makefile management and allows contributors to **add new modules effortlessly**.

### WASM Build Flow (CMake → Vite Integration)

The diagram below illustrates how the root CMake orchestrator builds WASM modules and integrates with Vite for both development and production environments.

:::note
This diagram shows the full end-to-end WASM build flow from CMake to Vite and how development vs production builds differ.
:::

```mermaid
flowchart TD
    %% Start
    A["Run emcmake cmake .."] --> B["Root CMakeLists.txt"]

    %% Emscripten check
    B --> C{"Emscripten installed?"}
    C -->|Yes| D["Set C++17 and Release build"]
    C -->|No| E["Fatal Error: Install Emscripten"]

    %% Module discovery
    D --> F["Auto-discover modules in modules/ folder"]
    F --> G["For each module with CMakeLists.txt"]
    G --> H["add_subdirectory(module)"]
    H --> I["Compile module to WASM"]

    %% WASM output
    I --> J["WASM output in module/build folder"]

    %% Integration with Vite
    J --> K{"Vite Environment?"}
    K -->|Development| L["Hot-reload WASM with dev server"]
    K -->|Production| M["Use prebuilt WASM modules"]
    L --> N["Vite serves React + WASM + assets"]
    M --> N
````

### Explanation of Flow:

1. **Start:** Run `emcmake cmake ..` to initialize Emscripten environment.  
2. **Root CMakeLists.txt:** Sets build configuration, ensures C++17 and Release mode.  
3. **Emscripten Check:** Fails immediately if Emscripten is not installed.  
4. **Module Discovery:** Automatically finds modules in `modules/` folder with `CMakeLists.txt`.  
5. **Compilation:** Each module is added via `add_subdirectory` and compiled to WASM.  
6. **WASM Output:** Compiled files go to `module/build`.  
7. **Vite Integration:**  
   - **Development:** Hot-reloads WASM modules on source changes.  
   - **Production:** Uses prebuilt WASM modules.  
8. **Final:** React + WASM modules are served by Vite with proper aliases.

