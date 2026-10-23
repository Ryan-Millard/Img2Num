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

:::caution Buffer Format: RGBA Only
All Img2Num functions operate on raw row-major image buffers (`uint8_t*`) and strictly require **RGBA format (4 bytes per pixel)**. A buffer of size `width * height` requires `(size_t)width * (size_t)height * 4` bytes. Passing RGB (3 bytes/pixel) or grayscale (1 byte/pixel) buffers will cause out-of-bounds memory corruption.
:::

## Key Functions

* `img2num_image_to_svg` — Full pipeline: converts an RGBA raster image to an SVG string
* `img2num_labels_to_svg` — Converts segmented label buffers to SVG paths
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

## Error Handling

Error codes and diagnostic messages are managed through `<cimg2num/img2num_error_t.h>`:
- `img2num_get_last_error()` — Returns the last `img2num_error_t` status code (`IMG2NUM_OK`, `IMG2NUM_ERROR_BAD_ALLOC`, `IMG2NUM_ERROR_INVALID_ARGUMENT`, etc.).
- `img2num_get_last_error_message()` — Returns a human-readable string describing the error.
- `img2num_clear_last_error()` — Resets the thread-local error state.

## CMake Integration

Link against `CImg2Num` in your `CMakeLists.txt`:

```cmake
find_package(CImg2Num REQUIRED)
target_link_libraries(your_app PRIVATE CImg2Num::CImg2Num)
```

## Documentation

The Doxygen documentation provides detailed descriptions of all functions, their parameters, and usage examples.
Refer to the [generated docs](./api-reference) for guidance on integrating the bindings into internal projects.
