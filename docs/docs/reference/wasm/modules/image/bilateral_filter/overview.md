---
id: overview
title: Bilateral Filter
sidebar_label: Overview
sidebar_position: 2
---

# Bilateral Filter

This section introduces the **bilateral filter** used in the Img2Num project
(see [`bilateral_filter.h`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/include/bilateral_filter.h)
& [`bilateral_filter.cpp`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/bilateral_filter.cpp)).
It focuses on how the algorithm is implemented, why each step is necessary,
and where the corresponding code lives so you can jump straight into the implementation.

## At a glance
- **Algorithm:** Bilateral Filter (Non-linear, edge-preserving).
- **Data type:** `uint8_t` (8-bit unsigned integer channels).
- **Key steps:**
  1. For each pixel, inspect neighbors in radius $R$.
  2. Weight neighbors by **spatial distance** (Gaussian).
  3. Weight neighbors by **intensity difference** (Gaussian).
  4. Normalize and average.

## Pages in this mini-guide

* **Overview** (this page)
* **Implementation details** — step-by-step mapping between theory and the actual C++ code.
* **API & reference** — brief function signatures and purpose for quick lookup.

Jump to implementation: [Implementation details](../implementation/)
