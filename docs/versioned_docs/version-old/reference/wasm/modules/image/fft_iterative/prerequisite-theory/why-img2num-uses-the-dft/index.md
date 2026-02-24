---
id: why-img2num-uses-the-dft
title: Why Img2Num Uses the DFT
sidebar_position: 8
---

1. **Inputs are digital** — images and arrays are sampled and finite; the DFT exactly models the transform we can compute on them.
2. **Finite memory** — continuous transforms need infinite support; DFT works with finite-length vectors held in RAM.
3. **Efficient algorithms exist** — the FFT computes the DFT quickly ($O(N\log N)$ rather than $O(N^2)$).
4. **Discrete manipulations match implementation** — convolution via multiplication in frequency domain, frequency-domain filters (Gaussian, high/low-pass) operate on bins.
5. **Compatibility with image processing conventions** — 2D DFT is separable: apply 1D DFT across rows then columns (or vice versa); per-channel processing is straightforward.

:::note Practical consequences to document in the repo

- Zero-padding to reduce circular convolution effects.
- Windowing to reduce spectral leakage.
- `fft shift` / `ifft shift` to center the zero frequency for visualization.
- Explain per-channel transforms for multi-channel images (RGB).
  :::
