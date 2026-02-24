---
title: Img2Num JS/WASM Bindings
sidebar_label: js
keywords: [Img2Num, JS bindings, WASM, WebAssembly, image processing, SVG conversion, gaussian blur, k-means clustering, bilateral filter]
description: Internal documentation for the Img2Num JS/WASM bindings, providing an overview of available functions, building instructions, and usage examples.
---

The **Img2Num JS/WASM Bindings** allow the core Img2Num image processing library to be used in JavaScript environments via WebAssembly. These bindings expose high-performance image processing, clustering, filtering, and SVG conversion functions to web and Node.js projects.

---

## Overview

The bindings wrap the C++ functions in a WASM module using **Emscripten**. Key image processing operations are exposed as `EMSCRIPTEN_KEEPALIVE` functions and operate on `Uint8Array` buffers in JavaScript.

## Key Functions

* `gaussian_blur_fft` — Apply FFT-based Gaussian blur
* `invert_image` — Invert pixel values in an image
* `threshold_image` — Apply thresholding to an image
* `black_threshold_image` — Apply black-thresholding
* `kmeans` — Perform k-means clustering on image pixels
* `bilateral_filter` — Apply bilateral filtering
* `labels_to_svg` — Convert labeled image to SVG

Each function is documented with Doxygen and mirrors the functionality of the corresponding C++ function.

## Building the WASM Module

```bash title="Run this in the root of the project"
emcmake cmake -B build-wasm .
cmake --build build-wasm
```

* The module outputs `index.js` and `index.wasm` in `packages/js/build-wasm`.
* Core library object files (`core_obj`) must be available and linked.
* SIMD support (`-msimd128`) is enabled for performance.

:::caution Using JavaScript
Interfacing with raw WASM in JavaScript is dangerous. As a result, we have built a safety wrapper around it to avoid manual memory management.

See [`packages/js`](../../packages/js).
:::

## Documentation

Detailed Doxygen documentation is available for each function, describing parameters, expected input types, and usage examples. Refer to the
[generated docs](./api-reference) for guidance on integrating the WASM bindings into internal projects.
