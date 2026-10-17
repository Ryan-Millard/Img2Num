---
id: debug-logging
title: Debug Logging
sidebar_label: 🪲 Debug Logging
---

## Overview

Img2Num uses [spdlog](https://github.com/gabime/spdlog) for compile-time gated debug logging.
spdlog is header-only and is used in every build (C++, C, WASM and Python). What changes
between builds is the **log level**, which is chosen when you compile.

Raw `iostream` and `stdio` output is banned in library code. Use the logging macros instead
(see [How the "no iostream" rule is enforced](#how-the-no-iostream-rule-is-enforced)).

## Using the logging macros

Include the logging header in your file:

```cpp
#include "internal/log.h"
```

The header lives at `core/include/internal/log.h`. It provides one macro per level, from
most to least verbose:

- `IMG2NUM_LOG_TRACE(...)`
- `IMG2NUM_LOG_DEBUG(...)`
- `IMG2NUM_LOG_INFO(...)`
- `IMG2NUM_LOG_WARN(...)`
- `IMG2NUM_LOG_ERROR(...)`
- `IMG2NUM_LOG_CRITICAL(...)`

Example:

```cpp
IMG2NUM_LOG_INFO("GPU initialized");
IMG2NUM_LOG_WARN("Falling back to CPU");
IMG2NUM_LOG_ERROR("Fatal: {}", error_message);
IMG2NUM_LOG_DEBUG("Processing pixel {}", index);
```

Messages are written to stdout by the `img2num` logger.

## Choosing the log level

The level is a **compile-time** setting. It is controlled by the CMake option
`IMG2NUM_LOG_LEVEL`, which accepts:

`AUTO` (default), `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`, `OFF`

With `AUTO`, the level is picked from the build type:

| Build type                            | Resolved level | Effect                    |
| ------------------------------------- | -------------- | ------------------------- |
| `Debug`                               | `TRACE`        | Everything is logged      |
| `Release`, `MinSizeRel`               | `OFF`          | Logging is fully stripped |
| Anything else (e.g. `RelWithDebInfo`) | `INFO`         | `INFO` and above          |

Macros below the chosen level are compiled out completely. This means a default
**Release build prints no logs**. If you change the level, you must rebuild.

## Enabling logging per build

Every `just` build recipe takes the **build type first** and the **log level second**.
Both are optional and default to `Release` and `AUTO`.

```bash title="Paste this inside the Docker shell"
# C++ core and C bindings
just cmake build Debug TRACE

# JS / WASM bindings
just js build Debug TRACE

# Browser and Node.js npm packages
just js package Debug TRACE

# Python bindings
just py build Debug TRACE

# Everything
just build-all Debug TRACE
```

To set the level with plain CMake instead of `just`:

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DIMG2NUM_LOG_LEVEL=OFF -B build-release/ .
```

To check it worked, build with `Debug` and run the C++ console example. It should print
log lines. A `Release` build of the same example should print none.

```bash title="Paste this inside the Docker shell"
just cmake build Debug TRACE
just console-cpp <path-to-image>
```

## Why spdlog?

- Compile-time gated, so there is zero overhead when logging is `OFF`
- Cannot accidentally ship debug output in a default Release build
- Works across the C++ core, C bindings, and Python bindings
- Header-only, so it is used the same way in every build, including WASM

## How the "no iostream" rule is enforced

The rule is enforced by **clang-tidy**, configured in `.clang-tidy`, not by a GitHub
Actions workflow that searches for `std::cout`. Two checks do the work, and both are
treated as errors:

- `portability-restrict-system-includes` blocks `<iostream>`, `<ostream>`, `<istream>`,
  `<cstdio>`, `<stdio.h>`, `<print>` and `<syncstream>`. This is what bans `std::cout`
  and `std::cerr`.
- `bugprone-unsafe-functions` flags `printf`, `fprintf`, `puts`, `putchar`, `vprintf`
  and `perror`, and points you to the logging macros in `core/include/internal/log.h`.

:::caution[CI step currently disabled]

The clang-tidy step in `.github/workflows/ci.yml` is commented out until
[#607](https://github.com/Ryan-Millard/Img2Num/issues/607) is resolved, so CI does not
currently catch these violations. Please avoid them anyway, and use the logging macros.

:::
