---
id: overview
title: Iterative FFT — Overview
sidebar_label: Overview
sidebar_position: 2
---

# FFT — Iterative Implementation (Overview)

This section introduces the **iterative, radix-2, decimation-in-time (DIT) FFT** used in the Img2Num project
(see [`fft_iterative.h`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/include/fft_iterative.h)
& [`fft_iterative.cpp`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/fft_iterative.cpp)).
It focuses on how the algorithm is implemented, why each step is necessary,
and where the corresponding code lives so you can jump straight into the implementation.

If you need the mathematical background before diving in, see the prerequisite page: [Prerequisite theory](./prerequisite-theory/).

## At a glance

- **Algorithm:** Radix-2, Decimation-in-Time (DIT), iterative, in-place.
- **Complex type:** `std::complex<double>` (double precision for numerical stability).
- **Key steps:**
  1. Bit-reversal permutation (reorder input indices)
  2. Iterative butterfly stages (combine sub-DFTs)
  3. Twiddle-factor multiplication (complex phase rotations)
  4. Optional inverse normalization (`1/N`)

## Pages in this mini-guide

* **Overview** (this page)
* **Implementation details** — step-by-step mapping between theory and the actual C++ code.
* **API & reference** — brief function signatures and purpose for quick lookup.

Jump to implementation: [Implementation details](./implementation/)
