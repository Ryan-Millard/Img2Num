---
id: implementation
title: Iterative FFT — Implementation details
sidebar_label: Implementation
sidebar_position: 4
---

# Iterative FFT — Implementation details

This page maps the conceptual steps of the iterative FFT to the concrete functions and loops in the implementation. Use this when you want to understand a particular loop or optimize the code.

:::important
The iterative FFT efficiently computes the DFT using these key steps. Each step—bit-reversal,
butterfly operations, and twiddle factor multiplication corresponds directly to the mathematical
structure of the Cooley-Tukey algorithm. Avoiding recursion and using in-place computation keeps it memory
and cache-efficient, which is crucial for large signals or image processing pipelines.
:::

## DIT vs DIF and where bit-reversal lives

The implementation is **DIT** (decimation-in-time). That implies the input must be bit-reversed **before** the main butterfly stages. The function responsible is:

```cpp
void bit_reverse_permute(std::vector<cd> &a);
```

:::tip Why input bit-reversal?
In DIT, successive stages assume contiguous blocks of data represent the smaller sub-DFTs. Reordering at the start makes each stage operate on contiguous memory and avoids recursion.
:::

## Main iterative loop (butterflies)

The iterative core uses three nested loops:

```cpp title="Stage loop (m = 2, 4, 8, ...)"
for (len = 2; len <= N; len <<= 1);
```

```cpp title="Block loop (process each block of size 'len')"
for (i = 0; i < N; i += len);
```

```cpp title="Butterfly loop inside a block"
for (j = 0; j < len/2; ++j);
```

Inside the inner loop the butterfly is implemented as:

```cpp
cd u = a[i + j];
cd v = a[i + j + half] * w;
a[i + j] = u + v;
a[i + j + half] = u - v;
w *= wlen; // advance twiddle
```

This corresponds exactly to the algebraic forms `y0 = u + w·v` and `y1 = u − w·v`.

## Twiddle factors

Twiddle factors are computed per-stage using `std::polar`:

```cpp
const double angle = sign * 2.0 * PI / double(len);
const cd wlen = std::polar(1.0, angle);
```

`w` starts at `1.0` for each block and is multiplied by `wlen` after each butterfly. The code uses `sign = -1` for forward FFT and `+1` for inverse
(**engineering convention**).

## Inverse transform and normalization

If `inverse` is `true`, the implementation uses the conjugate sign for twiddles and then divides every output element by `N` at the end to normalize:

```cpp
if (inverse) for (size_t i = 0; i < N; ++i) a[i] /= double(N);
```

This yields the true inverse DFT.

## Padding & 2D transforms

- The code auto-pads input to the next power of two using `next_power_of_two` and `pad_to_pow_two`.
- 2D transforms are implemented by running the 1D FFT across rows, then across columns (separable property). See `iterative_fft_2d(...)`.

## Practical optimization notes

- Precompute stage roots if you want to micro-optimise repeated transforms of the same size.
- Keep the transform in-place to minimise allocations and improve cache locality.
- Use `double` for better precision; `float` can be used for speed but expect more numerical error for large N.
