---
id: glossary
title: Glossary
sidebar_position: 5
toc_max_heading_level: 2
description: "Key Img2Num terms — quantization, contour tracing, path simplification, palettes, histograms, frequency transforms, color spaces, filtering, and clustering."
keywords:
  - img2num
  - glossary
  - quantization
  - contour tracing
  - path simplification
  - palettes
  - histograms
  - frequency transforms
  - bilateral filtering
  - k-means clustering
  - color spaces
---

Understanding these terms will help you get the best results from Img2Num.

Terms are listed alphabetically. By category:

- **Color:** [Color Spaces](#color-spaces), [Histograms](#histograms), [K-Means Clustering](#k-means-clustering), [Palettes](#palettes), [Quantization](#quantization)
- **Filtering and frequency:** [Bilateral Filtering](#bilateral-filtering), [Frequency Transforms](#frequency-transforms)
- **Vectorization:** [Contour Tracing](#contour-tracing), [Path Simplification](#path-simplification)

## Bilateral Filtering

A smoothing filter that reduces noise while preserving edges. It applies two Gaussian kernels at once: one for nearby pixels in space, and one for pixels with similar intensity values.

$$
\begin{aligned}
\text{result} &= \text{weighted\_average}(\text{input\_pixels}) \\
\text{weight} &= \exp\left(-\frac{\text{dist}^2}{2\sigma_{\text{s}}^2}\right)\;
                \cdot\;
                \exp\left(-\frac{\Delta \text{intensity}^2}{2\sigma_{\text{r}}^2}\right)
\end{aligned}
$$

### Spatial Kernel

> **Typical value:** 3

$\sigma_{s}$ (`sigma_spatial`) controls neighbor pixel smoothing in the image plane.
Neighbors are pixels that are close to each other.

import RgbVsLabRangeKernel from "@site/src/components/docs/reference/wasm/modules/image/bilateral_filter/RgbVsLabRangeKernel";

<RgbVsLabRangeKernel />

### Range Kernel

> **Typical value:** 50

$\sigma_{r}$ (`sigma_range`) controls smoothing of pixels with similar intensity values.

For example, a pixel with value `rgba(213,13,67)` and another with `rgba(195,17,87)` may be considered similar
and get smoothed together.

## Color Spaces

Img2Num supports two color spaces for k-means clustering:

| Space       | ID  | Description                                                    | Use when…                                        |
| :---------- | :-- | :------------------------------------------------------------- | :----------------------------------------------- |
| **CIE LAB** | `0` | Perceptually uniform — distances match human color perception. | Accurate color matching matters more than speed. |
| **sRGB**    | `1` | Faster computation in the native display space.                | You need speed and color accuracy is secondary.  |

## Contour Tracing

Finding the boundary of each flat color region so it can become an SVG path.

Img2Num traces region boundaries with **Suzuki–Abe contour tracing**, a border-following method that also captures holes and nesting. Tiny regions below `min_area` are filtered out before tracing so noise does not become tiny paths.

## Frequency Transforms

Converting an image between the spatial domain (pixels) and the frequency domain (how much of each frequency is present).

Img2Num uses the **Discrete Fourier Transform via FFT** for fast frequency-domain filtering, for example `gaussian_blur_fft`. Convolution in pixel space becomes multiplication in frequency space, which is much faster for large blurs.

## Histograms

A chart that counts how many pixels fall into each color or brightness bucket.

Use a histogram to see if an image has a few dominant colors or a wide spread, to pick a sensible `num_colors`, and to diagnose noisy or washed-out output.

## K-Means Clustering

K-means groups pixels into _k_ clusters based on color distance in the chosen color space.

- **`k` (num_colors)**: How many colors the output should contain.
- **`max_iter`**: Maximum iterations allowed before forcing termination.

:::note

`k` and `max_iter` are not guarantees.

- `k` cannot force new colors: if the image only has `2` colors and $k=5$, the image cannot gain more color.
- `max_iter` is an upper limit **only**: if $max_{iter}=999$ and it only takes `50` iterations to cluster the image,
  the function will return early (before the 999<sup>th</sup> iteration).

:::

:::tip[Choosing the Value of `k`]
Larger images benefit from more colors (`k`), but too many will produce noisy contours.
:::

## Palettes

The small set of representative colors left after [Quantization](#quantization).

Img2Num reduces an image to any `k` number of colors with k-means. The output SVG is organized into logical color groups, one per palette entry.

## Path Simplification

Reducing traced contours to fewer, smoother SVG curve segments without losing the shape.

After [Contour Tracing](#contour-tracing), Img2Num smooths contours with **Savitzky–Golay filtering** and fits smooth quadratic curves (B-spline simplification). Raising `min_area` also drops tiny contours, which simplifies the file and removes speckle.

## Quantization

Reducing an image from thousands of distinct colors to a small [Palette](#palettes) of `k` representative colors.

Img2Num quantizes with **k-means clustering** in CIE LAB or sRGB. Fewer colors means a smaller, cleaner SVG but less detail; more colors preserves detail but can add noisy contours.
