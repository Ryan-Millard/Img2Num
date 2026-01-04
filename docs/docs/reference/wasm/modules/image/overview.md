---
id: overview
title: Image Module Overview
sidebar_position: 1
---

# Image Module

The **Image** WASM module provides core image-processing functionality for Img2Num. It exposes C++ image utilities, pixel structures, FFT operations, K-means clustering, and region-merging algorithms.

## Structure

```
src/wasm/modules/image/
├── CMakeLists.txt
├── include
│   ├── Image.h
│   ├── Pixel.h
│   ├── PixelConverter.h
│   ├── PixelConverters.h
│   ├── RGBAPixel.h
│   ├── RGBPixel.h
│   ├── exported.h
│   ├── fft_iterative.h
│   ├── image_utils.h
│   ├── kmeans.h
│   └── mergeSmallRegionsInPlace.h
└── src
    ├── fft_iterative.cpp
    ├── image_utils.cpp
    ├── kmeans.cpp
    └── mergeSmallRegionsInPlace.cpp
```

## Description

Each header corresponds to a major subsystem:

- `Pixel.h` / `RGBPixel.h` / `RGBAPixel.h` — Pixel representations.
  - **RGBPixel & RGBAPixel** inherit from **Pixel**.
- `Image.h` — Core image class.
  - Internally uses a **Pixel type**.
- `PixelConverters` — Functions for converting between pixel formats.
- `fft_iterative` — Fast Fourier Transform utilities.
  - Used by **Gaussian Blur** inside image_utils.h.
- `kmeans` — K-means clustering used for quantization.
- `mergeSmallRegionsInPlace` — Post-processing step for cleanup after K-means.

## Exports

`exported.h` defines **EXPORTED**, a macro used to declare a public API function that can be accessed by external code.
