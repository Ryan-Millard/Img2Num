---
id: api
title: Iterative FFT — API & Reference
sidebar_label: API / Usage
sidebar_position: 5
---

# Iterative FFT — API & Reference

Quick reference for the functions implemented in the header. Use this as a clipboard-friendly cheat sheet.

:::danger Power-of-two padding & resizing

This FFT implementation **requires power-of-two sizes**.

If the input length (1D) or dimensions (2D) are **not** powers of two, the input buffer is **automatically zero-padded and resized** to the next power of two **before** the transform is performed.

As a result:

- The FFT **does NOT always return the same size as the input**
- `iterative_fft` and `fft_copy` may **resize the input vector**
- `iterative_fft_2d` and `iterative_fft_2d_copy` may **resize the buffer and change the effective width/height**

If you require strict *same-size in / same-size out* behavior, ensure your input dimensions are already powers of two before calling these functions.
:::

| Function                |                                                                                                                Signature | Purpose                                                                                |
| ----------------------- | -----------------------------------------------------------------------------------------------------------------------: | --------------------------------------------------------------------------------       |
| `is_power_of_two`       |                                                                                         `bool is_power_of_two(size_t n)` | Check if `n` is a power of two.                                                        |
| `next_power_of_two`     |                                                                                     `size_t next_power_of_two(size_t n)` | Return the next power of two $$\ge n$$.                                                |
| `bit_reverse_permute`   |                                                                           `void bit_reverse_permute(std::vector<cd> &a)` | In-place bit-reversal permutation (required for DIT iterative FFT).                    |
| `pad_to_pow_two`        |                                                                     `void pad_to_pow_two(std::vector<cd> &a, size_t &N)` | Resize and zero-pad `a` to next power-of-two; updates `N` (the size of the array).     |
| `iterative_fft`         |                                                           `void iterative_fft(std::vector<cd> &a, bool inverse = false)` | In-place iterative FFT. `inverse=true` computes inverse and normalizes by `1/N`.       |
| `fft_copy`              |                                           `std::vector<cd> fft_copy(const std::vector<cd> &input, bool inverse = false)` | Convenience wrapper around `iterative_fft` returning a new vector with the FFT result. |
| `iterative_fft_2d`      |                           `void iterative_fft_2d(std::vector<cd> &a, size_t width, size_t height, bool inverse = false)` | In-place 2D FFT (pads to power-of-two dims if needed).                                 |
| `iterative_fft_2d_copy` | `std::vector<cd> iterative_fft_2d_copy(const std::vector<cd> &input, size_t width, size_t height, bool inverse = false)` | Returns a new vector with the 2D FFT result.                                           |

:::info Notes
- Sign convention: forward uses `-2πi`, inverse uses `+2πi` and divides by `N`.
- Implementation uses `std::polar` to create stage primitive roots.
:::
