# C++ API Documentation

The C++ API provides a full-featured interface to Img2Num's image processing pipeline. It is declared in `img2num.h` (under `core/include`).

## Installation

1. Build the library:

```bash
cmake -B build .
cmake --build build
```

2. Link against `img2num`:

```cmake
find_package(img2num REQUIRED)
target_link_libraries(myapp PRIVATE img2num)
```

Or include the headers directly:

```cpp
#include "img2num.h"
```

## Quick Example

```cpp
#include <img2num.h>
#include <iostream>

int main() {
    uint8_t* image_data = /* your RGBA buffer */;
    int width = 800, height = 600;

    // Convert raster to SVG
    std::string svg = img2num::image_to_svg(
        image_data, width, height,
        img2num::ImageToSvgConfig{}
    );

    std::cout << svg << std::endl;
    return 0;
}
```

## Pipeline Functions

| Function | Description |
| :--- | :--- |
| `bilateral_filter` | Edge-preserving smoothing |
| `kmeans` | Color palette reduction |
| `labels_to_svg` | Contour detection & vectorization |
| `image_to_svg` | Full pipeline (filter → cluster → trace) |

## Color Spaces

| Space | Constant | Use |
| :--- | :--- | :--- |
| **CIE LAB** | `0` | Perceptually accurate |
| **sRGB** | `1` | Faster computation |
