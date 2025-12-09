---
id: overview
title: Overview
sidebar_position: 2
---

# FFT — Overview

This page is a short overview of the iterative FFT implementation in `src/wasm/modules/image`.

The implementation provides a compact, iterative (non-recursive) FFT with utilities for 1D and 2D transforms. It is designed to be used in-place on `std::vector<std::complex<double>>` buffers and includes small helpers for power-of-two padding and bit-reversal permutation.

## Key capabilities

* In-place iterative FFT (`iterative_fft`) with optional inverse (normalizes on inverse).
* Convenience wrappers that return new vectors (`fft_copy`, `iterative_fft_2d_copy`).
* 2D FFT support via row/column transforms (`iterative_fft_2d`).
* Auto-padding to the next power of two when input length is not a power of two.

## Important notes

* Inputs are `std::complex<double>` vectors.
* The implementation pads inputs to a power of two when needed (so output length may increase).
* Complexity is `O(N log N)` for 1D transforms; 2D is handled via separable row/column FFTs.

## Minimal usage (C++ style)

```cpp
#include <complex>
#include <vector>
#include "fft_iterative.h"

std::vector<std::complex<double>> data = /* fill */;
// forward FFT (in-place)
//    data: signal in spatial domain
//    2nd argument: direction
//      false: transform to frequency domain
//      true:  transform to spatial domain
fft::iterative_fft(data, false);
// data is now in frequency domain

// inverse FFT (in-place)
fft::iterative_fft(data, true);
// data is back to spatial domain

// 2D example (width/height known)
fft::iterative_fft_2d(data, width, height, false);
// data is now in frequency domain
```

For details, see the source file
[`fft_iterative.cpp`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/fft_iterative.cpp)
and its header
[`fft_iterative.h`](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/include/fft_iterative.h).
