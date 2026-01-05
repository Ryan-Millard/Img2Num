---
id: overview
title: Bilateral Filter
sidebar_label: Overview
sidebar_position: 1
---

# Bilateral Filter

This section introduces the **bilateral filter** used in the Img2Num project
(see [`bilateral_filter.h`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/include/bilateral_filter.h)
& [`bilateral_filter.cpp`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/bilateral_filter.cpp)).
It focuses on how the algorithm is implemented, why each step is necessary,
and where the corresponding code lives so you can jump straight into the implementation.

:::important Why Img2Num Uses Bilateral Filters
In Img2Num, the bilateral filter is used to **reduce noise while preserving edges**, which is critical for accurate image
segmentation (via methods like K-Means clustering), contour extraction and vectorization.

Similarly to Gaussian blurs, it acts as a *low-pass filter* that reduces noise.
Conversely, it is *less aggressive than Gaussian blurs, since it takes spatial position (x & y coordinates) into account* -
allowing it to preserve sharp edges.
:::

## At a glance
- **Algorithm:** Bilateral Filter (Non-linear, edge-preserving).
- **Input/Output image data types:** `uint8_t` (8-bit unsigned integer channels).
- **Color spaces:** RGB & CIELAB can be chosen (see `color_space` in the [**API / Usage** section](../api/)).
- **Key steps:**
  1. For each pixel, inspect neighbors in radius $R$.
  2. Weight neighbors by **spatial distance** (Gaussian).
  3. Weight neighbors by **intensity/color difference** (Gaussian).
  4. Normalize and average.

## Keywords

The [keywords section](../keywords/) will help you in case the terminology confuses you.

:::tip Gaussian functions
Bilateral filters rely on Gaussian weighting, so understanding Gaussian functions will help when reading the implementation.
:::
