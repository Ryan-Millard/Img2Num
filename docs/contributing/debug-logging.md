# Debug Logging

URL: https://img2num.dev/docs/contributing/debug-logging

Img2Num uses [spdlog](https://github.com/gabime/spdlog) for **compile-time gated** debug logging. spdlog is header-only and is part of every build (C++, C, WASM and Python). What changes between builds is the **log level** , which you choose when you compile.

TL;DR

- This is only relevant for C and C++ code in Img2Num.
- Include `internal/log.h` and call the `IMG2NUM_LOG_*` macros.
- Pass the level when you build, e.g. `just cmake build Debug TRACE` .
- A default `Release` build prints **nothing** - logging is stripped at compile time.
- `std::cout` , `printf` and friends are banned in library code and caught by clang-tidy (see below ).

## Using the logging macros

Include the header, which lives at [`core/include/internal/log.h`](https://github.com/Ryan-Millard/Img2Num/blob/dev/core/include/internal/log.h) :

```cpp
#include "internal/log.h"
```

It provides one macro per level, from most to least verbose. Messages use spdlog's `{}` -style formatting and are written to stdout by the `img2num` logger.

| Macro | Typical use | `IMG2NUM_LOG_TRACE(...)` | Very fine-grained tracing, usually per iteration | `IMG2NUM_LOG_DEBUG(...)` | Diagnostic detail useful while developing | `IMG2NUM_LOG_INFO(...)` | High-level progress and state changes | `IMG2NUM_LOG_WARN(...)` | Something unexpected but recoverable | `IMG2NUM_LOG_ERROR(...)` | An operation failed | `IMG2NUM_LOG_CRITICAL(...)` | The process cannot continue 

Example

```cpp
IMG2NUM_LOG_INFO("GPU initialized");
IMG2NUM_LOG_WARN("Falling back to CPU");
IMG2NUM_LOG_ERROR("Fatal: {}", error_message);
IMG2NUM_LOG_DEBUG("Processing pixel {}", index);
```

note
Macros below the compiled-in level are removed entirely, so their arguments are never evaluated. Keep side effects out of log calls.

## Choosing the log level

The level is a **compile-time** setting controlled by the CMake option `IMG2NUM_LOG_LEVEL` . It accepts:

`AUTO` (default) ⋅ \cdot ⋅`TRACE`⋅ \cdot ⋅`DEBUG`⋅ \cdot ⋅`INFO`⋅ \cdot ⋅`WARN`⋅ \cdot ⋅`ERROR`⋅ \cdot ⋅`CRITICAL`⋅ \cdot ⋅`OFF`

With `AUTO` , the level is derived from the build type:

| Build type | Resolved level | Effect | `Debug` | `TRACE` | Everything is logged | `Release` , `MinSizeRel` | `OFF` | Logging is fully stripped | Anything else (e.g. `RelWithDebInfo` ) | `INFO` | `INFO` and above 

Changing the level requires a rebuild
Because the level is baked in at compile time, a default **Release build prints no logs** . If you change `IMG2NUM_LOG_LEVEL` or the build type, you must rebuild.

## Enabling logging per build

The C/C++, Python, and JS/WASM `just` build recipes take the **build type first** and the **log level second** . Both are optional and default to `Release` and `AUTO` .

- C++ / C - JS / WASM - Python - Everything - Plain CMake
Paste this inside the Docker shell

```bash
just cmake build Debug TRACE
```

Paste this inside the Docker shell

```bash
# Bindings only
just js build Debug TRACE

# Browser and Node.js npm packages
just js package Debug TRACE
```

Paste this inside the Docker shell

```bash
just py build Debug TRACE
```

Paste this inside the Docker shell

```bash
just build-all Debug TRACE
```

```bash
cmake -DCMAKE_BUILD_TYPE=Release -DIMG2NUM_LOG_LEVEL=OFF -B build-release/ .
```

### Verifying it worked

Build with `Debug` and run the C++ console example. It should print log lines; a `Release` build of the same example should print none.

Paste this inside the Docker shell

```bash
just cmake build Debug TRACE
just console-cpp <path-to-image>
```

## Why spdlog?

- **Zero overhead when `OFF`** - logging is gated at compile time, not at runtime.
- **Safe by default** - debug output cannot accidentally ship in a default Release build.
- **One API everywhere** - the same macros work in the C++ core, C bindings and Python bindings.
- **Header-only** - used the same way in every build, including WASM.

## How the "no iostream" rule is enforced

Raw `iostream` and `stdio` output is banned in library code. The rule is enforced by **clang-tidy** , configured in `.clang-tidy` - not by a GitHub Actions workflow that greps for `std::cout` . Two checks do the work, and both are treated as errors:

| Check | What it blocks | `portability-restrict-system-includes` | `<iostream>` , `<ostream>` , `<istream>` , `<cstdio>` , `<stdio.h>` , `<print>` , `<syncstream>` - i.e. `std::cout` and `std::cerr` | `bugprone-unsafe-functions` | `printf` , `fprintf` , `puts` , `putchar` , `vprintf` , `perror` - and points you to the logging macros 

CI step currently disabled
The clang-tidy step in `.github/workflows/ci.yml` is commented out until [#607](https://github.com/Ryan-Millard/Img2Num/issues/607) is resolved, so CI does **not** currently catch these violations. Please avoid them anyway and use the logging macros.
