---
title: Install Img2Num for C
description: Install and use the packaged Img2Num C library from a GitHub release.
sidebar_label: Installation
sidebar_position: 1
---

# Install Img2Num for C

Use the packaged C library when you want to use Img2Num in an application without adding the Img2Num source tree to your project. Build from source instead when you are developing Img2Num itself or contributing changes to the project.

## Download a release

Download the archive for your operating system from the [Img2Num GitHub releases](https://github.com/Ryan-Millard/Img2Num/releases). C releases use the `bindings-c-v<version>` tag and the following asset names:

| Platform | Archive |
| --- | --- |
| Linux x64 | `img2num-c-v<version>-linux-x64.tar.gz` |
| macOS ARM64 | `img2num-c-v<version>-macos-arm64.tar.gz` |
| Windows x64 | `img2num-c-v<version>-windows-x64.zip` |

For example, the latest release at the time of writing is [`bindings-c-v0.2.1`](https://github.com/Ryan-Millard/Img2Num/releases/tag/bindings-c-v0.2.1).

Extract the archive to a directory you control. The package has this layout:

```text
<img2num-c-package>/
├── include/
│   ├── cimg2num/
│   │   ├── cimg2num.h
│   │   └── cimg2num/
│   └── img2num/
└── lib/
    ├── libCImg2Num.a
    ├── libImg2Num.a
    └── cmake/
        ├── CImg2Num/
        └── Img2Num/
```

The exact library file extension depends on the platform and toolchain. Prefer the CMake package configuration shown below instead of hard-coding a library filename.

## Use the package with CMake

Set `CMAKE_PREFIX_PATH` to the extracted package directory. CMake will find the package configuration under `lib/cmake/CImg2Num`.

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.19)
project(c_img2num_example LANGUAGES C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

find_package(CImg2Num CONFIG REQUIRED)

add_executable(c_img2num_example main.c)
target_link_libraries(c_img2num_example PRIVATE CImg2Num::CImg2Num)
```

Configure and build:

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/path/to/img2num-c-package
cmake --build build --config Release
```

On Windows, use the extracted package directory as the value of `CMAKE_PREFIX_PATH`, for example:

```powershell
cmake -S . -B build -DCMAKE_PREFIX_PATH="C:\Libraries\img2num-c-package"
cmake --build build --config Release
```

## Minimal C example

The package exposes the C API through `cimg2num.h`. This example converts a one-pixel RGBA buffer to SVG:

```c title="main.c"
#include <cimg2num.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

int main(void) {
    const uint8_t pixel[] = {255, 0, 0, 255};
    img2num_ImageToSvgConfig config = img2num_ImageToSvgConfig_default();
    char* svg = img2num_image_to_svg(pixel, 1, 1, &config);

    if (svg == NULL) {
        fprintf(stderr, "Img2Num failed to generate SVG\n");
        return 1;
    }

    puts(svg);
    free(svg);
    return 0;
}
```

## Header and target names

- Include the main C API with `#include <cimg2num.h>`.
- Link the imported CMake target `CImg2Num::CImg2Num`.
- The C package also contains the core `Img2Num` package because the C binding depends on the core library.

## Build from source instead

Use the [Img2Num repository](https://github.com/Ryan-Millard/Img2Num) and its CMake project directly only when you need to modify Img2Num, test unreleased changes, or contribute to the project. For normal application integration, the packaged release is the recommended option.
