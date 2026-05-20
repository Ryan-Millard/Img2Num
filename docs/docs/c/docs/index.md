# C Binding Documentation

The C bindings (`cimg2num.h`) expose the Img2Num library as plain C functions. This is useful for:

- Embedding Img2Num in C projects
- Writing custom FFI wrappers
- Minimal overhead in systems programming

## Installation

1. Build the C++ library:

```bash
cmake -B build .
cmake --build build
```

2. Copy the header and shared library:

```bash
cp bindings/c/include/cimg2num.h /your/project/dir
cp build/libimg2num.so /your/project/dir  # .dylib on macOS, .dll on Windows
```

## Quick Example

```c
#include "cimg2num.h"
#include <stdlib.h>
#include <stdio.h>

int main() {
    img2num_ImageToSvgConfig config = img2num_ImageToSvgConfig_default();
    config.kmeans.k = 16;

    // Assuming `image_data` is your RGBA buffer and width/height are known:
    char* svg = img2num_image_to_svg(
        image_data, width, height, &config
    );

    printf("%s\n", svg);
    free(svg);  // Important: free the returned SVG string
    return 0;
}
```

## Memory Management

- All functions that return `char*` (e.g., `img2num_image_to_svg`, `img2num_labels_to_svg`) allocate memory internally. **Callers must `free()` the result.**
- Buffers passed in (`uint8_t*`, `int32_t*`) are modified in-place or copied as specified.
