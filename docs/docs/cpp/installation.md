---
title: Install Img2Num for C++
description: Install and use the packaged Img2Num C++ library from a GitHub release.
sidebar_label: Installation
sidebar_position: 1
---

# Install Img2Num for C++

Use the packaged C++ library when you want to use Img2Num in an application without adding the Img2Num source tree to your project. Build from source instead when you are developing Img2Num itself or contributing changes to the project.

## Download a release

Download the archive for your operating system from the [Img2Num GitHub releases](https://github.com/Ryan-Millard/Img2Num/releases). C++ releases use the `cpp-v<version>` tag and the following asset names:

| Platform | Archive |
| --- | --- |
| Linux x64 | `img2num-cpp-v<version>-linux-x64.tar.gz` |
| macOS ARM64 | `img2num-cpp-v<version>-macos-arm64.tar.gz` |
| Windows x64 | `img2num-cpp-v<version>-windows-x64.zip` |

For example, the latest release at the time of writing is [`cpp-v0.3.0`](https://github.com/Ryan-Millard/Img2Num/releases/tag/cpp-v0.3.0).

Extract the archive to a directory you control. The package has this layout:

```text
<img2num-cpp-package>/
├── include/
│   └── img2num/
│       ├── img2num.h
│       └── img2num/
└── lib/
    ├── libImg2Num.a
    └── cmake/
        └── Img2Num/
```

The exact library file extension depends on the platform and toolchain. Prefer the CMake package configuration shown below instead of hard-coding a library filename.

## Use the package with CMake

Set `CMAKE_PREFIX_PATH` to the extracted package directory. CMake will find the package configuration under `lib/cmake/Img2Num`.

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.19)
project(cpp_img2num_example LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Img2Num CONFIG REQUIRED)

add_executable(cpp_img2num_example main.cpp)
target_link_libraries(cpp_img2num_example PRIVATE Img2Num::Img2Num)
```

Configure and build:

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/path/to/img2num-cpp-package
cmake --build build --config Release
```

On Windows, use the extracted package directory as the value of `CMAKE_PREFIX_PATH`, for example:

```powershell
cmake -S . -B build -DCMAKE_PREFIX_PATH="C:\Libraries\img2num-cpp-package"
cmake --build build --config Release
```

## Minimal C++ example

The package exposes the C++ API through `img2num.h`. This example converts a one-pixel RGBA buffer to SVG:

```cpp title="main.cpp"
#include <cstdint>
#include <iostream>
#include <img2num.h>
#include <string>

int main() {
    const std::uint8_t pixel[] = {255, 0, 0, 255};
    const img2num::ImageToSvgConfig config;
    const std::string svg = img2num::image_to_svg(pixel, 1, 1, config);

    std::cout << svg << '\n';
    return 0;
}
```

:::warning[Static package dependency]

The `cpp-v0.3.0` release is a static library package. Its exported `Img2Num::Img2Num` target does not currently declare the Dawn WebGPU libraries required by the implementation. As a result, applications that call GPU-backed functions such as `img2num::image_to_svg` may fail at link time with missing WebGPU/Dawn symbols.

The package does not include a consumer-facing Dawn dependency archive, so there is no portable additional library list to add to this example. Until the exported target supplies its transitive Dawn dependencies, use a source build for applications that need these functions, or track the corresponding packaging issue in the project repository.

:::

## Header and target names

- Include the main C++ API with `#include <img2num.h>`.
- Link the imported CMake target `Img2Num::Img2Num`.
- The package requires a C++17-compatible compiler.

## Build from source instead

Use the [Img2Num repository](https://github.com/Ryan-Millard/Img2Num) and its CMake project directly only when you need to modify Img2Num, test unreleased changes, or contribute to the project. For normal application integration, the packaged release is the recommended option.
