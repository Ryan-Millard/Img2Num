---
id: debug-logging
title: Debug Logging
sidebar_label: 🪲 Debug Logging
---

## Overview

Img2Num uses [spdlog](https://github.com/gabime/spdlog) for compile-time gated debug logging.
Raw `std::cout` and `std::cerr` are banned from production code — CI will fail if they are detected.

## Using the Debug Macros

Include the debug header in your file:

```cpp
#include "internal/debug.h"
```

Then use the macros:

```cpp
IMG2NUM_LOG_INFO("GPU initialized");
IMG2NUM_LOG_WARN("Falling back to CPU");
IMG2NUM_LOG_ERROR("Fatal: {}", error_message);
IMG2NUM_LOG_DEBUG("Processing pixel {}", index);
```

## Enabling Debug Logging

Debug logging is enabled by default. To disable it, pass the CMake flag:

```bash
cmake -DIMG2NUM_ENABLE_DEBUG_LOGGING=OFF -B build-release/ .
```

> Note: `std::flush` should be used when you need to ensure output is flushed immediately,
> unless you design a specific Emscripten macro branch that handles flushing automatically.

## Why spdlog?

- Compile-time gated — zero overhead in production
- Cannot accidentally ship debug output
- Works across C++ core, C bindings, and Python bindings
- Not linked against in WASM builds (Emscripten uses its own console functions)

## CI Enforcement

A GitHub Actions workflow checks all C++ files (excluding `third_party/` and `example-apps/`)
for raw `std::cout` and `std::cerr` usage. PRs will fail if violations are found.