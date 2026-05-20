---
id: concepts
title: Core Concepts
sidebar_position: 4
---

# Core Concepts

Understanding these concepts will help you get the best results from Img2Num.

## Color Spaces

Img2Num supports two color spaces for k-means clustering:

| Space | ID | Description | Use when… |
| :--- | :--- | :--- | :--- |
| **CIE LAB** | `0` | Perceptually uniform — distances match human color perception. | Accurate color matching matters more than speed. |
| **sRGB** | `1` | Faster computation in the native display space. | You need speed and color accuracy is secondary. |

## Bilateral Filtering

The bilateral filter applies two Gaussian kernels:

- **Spatial kernel** (`sigma_spatial`): Smooths pixels close to each other in the image plane.
- **Range kernel** (`sigma_range`): Smoothes pixels with similar intensity values.

```
result = weighted_average(input_pixels)
weight = exp(-dist² / 2σ²_spatial) × exp(-Δintensity² / 2σ²_range)
```

Typical values:

- `sigma_spatial = 3`
- `sigma_range = 50`

## K-Means Clustering

K-means groups pixels into *k* clusters based on color distance in the chosen color space.

- **`k` (num_colors)**: How many colors the output should contain.
- **`max_iter`**: Stop the algorithm early if `100` iterations aren't enough.

:::tip
Larger images benefit from more colors (`k`), but too many will produce noisy contours.
:::

## Contour Tracing & Simplification

Img2Num uses the following pipeline for finding vector paths:

1. **Label image** from the k-means output.
2. **Find contours** of each label using marching-squares-style boundary detection.
3. **Simplify** contours to quadratic B-splines with area-based filtering (`min_area`).

## Minimum Cluster Area

`min_area` (default `100` pixels) filters out small contours that are usually noise or fine texture. Increase it for cleaner, more stylized SVGs.
