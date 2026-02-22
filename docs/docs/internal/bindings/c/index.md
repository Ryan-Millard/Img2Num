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

The bindings wrap the underlying C++ functions (from [`core/`](../../core)) in a C interface using `extern "C"`. They operate on raw image buffers (`uint8_t*`) and provide access to key image processing operations.

## Key Functions

* `img2num_gaussian_blur_fft` — Apply FFT-based Gaussian blur
* `img2num_invert_image` — Invert pixel values in an image
* `img2num_threshold_image` — Apply thresholding to an image
* `img2num_black_threshold_image` — Apply black-thresholding
* `img2num_kmeans` — Perform k-means clustering on image pixels
* `img2num_bilateral_filter` — Apply bilateral filtering
* `img2num_labels_to_svg` — Convert labeled image to SVG

Each function is fully documented with Doxygen and mirrors the corresponding C++ function in `core/img2num.h`.

## Building the C Bindings

```bash title="Run this in the root of the project"
cmake -B build .
cmake --build build
cmake --install build
```

> `cmake --install build` might need elevated permissions, but that shouldn't be a problem in the Docker container.

* The library is installed under `lib/` and headers under `include/cimg2num`.
* Ensure that the core `Img2Num` library is built and accessible.

## Usage Example

:::important Proper Examples
See the [`example-apps/`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/) folder for the most up-to-date usage examples.
:::

```c title="Applying basic image processing operations using the C API"
#include "cimg2num.h"
#include <stdint.h>

int main() {
    uint8_t image[256*256];  // Example image buffer
    img2num_gaussian_blur_fft(image, 256, 256, 1.5);
    img2num_invert_image(image, 256, 256);

    // Further processing...
    return 0;
}
```

## Documentation

The Doxygen documentation provides detailed descriptions of all functions, their parameters, and usage examples.
Refer to the [generated docs](./api-reference) for guidance on integrating the bindings into internal projects.
