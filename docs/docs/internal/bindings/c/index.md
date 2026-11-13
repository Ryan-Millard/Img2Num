---
title: Img2Num C Bindings
sidebar_label: c
keywords: [Img2Num, C bindings, image processing, SVG conversion, gaussian blur, k-means clustering, bilateral filter]
description: Internal documentation for the Img2Num C bindings, providing an overview of available functions, building instructions, and usage examples.
---

# Img2Num C Bindings

The **Img2Num C Bindings** provide a C-friendly interface to the core Img2Num image processing library. These bindings allow internal developers to access the library's functionality from C projects, including image filtering, clustering, and conversion to SVG.

---

## Overview

The bindings wrap the underlying C++ functions (from [`core/`](../../core)) in a C interface using `extern "C"`. 

:::caution[Buffer Format: RGBA Only]
All Img2Num functions operate on raw row-major image buffers (`uint8_t*`) and strictly require **RGBA format (4 bytes per pixel)**. A buffer of size `width * height` requires `(size_t)width * (size_t)height * 4` bytes. Passing RGB (3 bytes/pixel) or grayscale (1 byte/pixel) buffers will cause out-of-bounds memory corruption.
:::

## Key Functions

* `img2num_image_to_svg` — Full pipeline: converts an RGBA raster image to an SVG string (alpha channel is discarded; paths are rendered opaque)
* `img2num_labels_to_svg` — Converts segmented label buffers to SVG paths (paths are rendered opaque)
* `img2num_gaussian_blur_fft` — Applies FFT-based Gaussian blur
* `img2num_invert_image` — Inverts pixel values in an image
* `img2num_threshold_image` — Applies thresholding to an image
* `img2num_black_threshold_image` — Applies black-thresholding
* `img2num_kmeans` — Performs k-means color quantization on image pixels
* `img2num_bilateral_filter` — Applies edge-preserving bilateral filtering

Each function is fully documented with Doxygen and mirrors the corresponding C++ function in `core/include/img2num.h`.

## Memory Ownership

Functions that return a dynamic string (`char*`), such as `img2num_image_to_svg()` and `img2num_labels_to_svg()`, allocate the returned buffer via `malloc()`. 

**The caller owns the returned string and must release it using `free()`.**

Note that `img2num_get_last_error_message()` returns a borrowed pointer to thread-local storage; **callers must not free this pointer**.

## Error Handling

Error codes and diagnostic messages are managed through `<cimg2num/img2num_error_t.h>`:
- `img2num_get_last_error()` — Returns the last `img2num_error_t` status code (`IMG2NUM_OK`, `IMG2NUM_ERROR_BAD_ALLOC`, `IMG2NUM_ERROR_INVALID_ARGUMENT`, etc.).
- `img2num_get_last_error_message()` — Returns a borrowed human-readable string describing the error (thread-local; do not free).
- `img2num_clear_last_error()` — Resets the thread-local error state.

## CMake Integration

Link against `CImg2Num` in your `CMakeLists.txt`:

```cmake
find_package(CImg2Num REQUIRED)
target_link_libraries(your_app PRIVATE CImg2Num::CImg2Num)
```

## Usage Example

```c title="Converting an RGBA image to SVG using the C API"
#include <cimg2num.h>
#include <cimg2num/img2num_error_t.h>
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    const int width = 256, height = 256;

    /* RGBA: 4 bytes per pixel */
    uint8_t* image = calloc((size_t)width * (size_t)height * 4, 1);
    if (!image) return 1;

    /* ... fill `image` with your pixel data ... */

    img2num_ImageToSvgConfig config = img2num_ImageToSvgConfig_default();
    char* svg = img2num_image_to_svg(image, width, height, &config);
    if (!svg) {
        const char* err = img2num_get_last_error_message();
        fprintf(stderr, "img2num: %s\n", (err && *err) ? err : "SVG conversion or allocation failed");
        img2num_clear_last_error();
        free(image);
        return 1;
    }

    puts(svg);
    free(svg);   /* the caller owns the returned string */
    free(image);
    return 0;
}
```

## Documentation

The Doxygen documentation provides detailed descriptions of all functions, their parameters, and usage examples.
Refer to the [generated docs](./api-reference) for guidance on integrating the bindings into internal projects.
