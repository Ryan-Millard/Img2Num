---
id: explained
title: Implementation Explained
sidebar_position: 5
---

# Bilateral Filter — Implementation Explained

This section explains the inner workings of the **bilateral filter** implementation.

## Overview

The bilateral filter smoothes an image while **preserving edges**. It achieves this by weighting neighboring pixels based on two criteria:
1.  **Spatial Distance**: Pixels closer to the center have higher weight.
2.  **Range (Color) Difference**: Pixels with similar colors to the center have higher weight.

This prevents the "blurring" from crossing strong edges, where the color difference is large.

## How It Works

For each pixel in the image, we look at a local window (kernel) around it. The new pixel value is a weighted average of its neighbors:
$$
I_{new}(x) = \frac{1}{W_p} \sum_{x_i \in \Omega} I(x_i) \cdot w_{spatial}(\|x_i - x\|) \cdot w_{range}(|I(x_i) - I(x)|)
$$

Where each component means:

- $x$: The coordinates of the **center pixel** being filtered.
- $\Omega$: The set of **neighboring pixels** in the local kernel around $x$ (from `-radius` to `+radius`).
- $I(x_i)$: The **color or intensity** of a neighbor pixel $x_i$.
- $C(x_i)$: The **color vector** of pixel $x_i$.
  - RGB: `[R, G, B]`
  - CIELAB: `[L*, a*, b*]`
- $w_{spatial}(|x_i - x|)$: A **Gaussian weight** based on the **spatial distance** between the neighbor and the center.
  - Pixels closer to the center have **larger weights**.
  - Formula: $\exp\Big(-\frac{\text{distance}^2}{2\sigma_s^2}\Big)$
- $w_\text{range}(|C(x_i) - C(x)|)$: A **Gaussian weight** based on the **color difference** between neighbor and center.
  - Pixels with **similar colors** have higher weights, preserving edges.
  - Formula: $\exp\Big(-\frac{|C(x_i) - C(x)|^2}{2\sigma_r^2}\Big)$
  - RGB: Precomputed via **LUT**
  - CIELAB: Computed **on the fly**
- $W_p = \sum_{x_i \in \Omega} w_{spatial} \cdot w_\text{range}$: **Normalization factor** to ensure the weighted average sums to a valid color.
- **Result $I_\text{new}(x)$**: The **filtered color** of the center pixel after combining spatial and color-based weighting.
- $|I(x_i) - I(x)|$: The Euclidean norm.
  - **RGB**: $|I(x_i) - I(x)| = \sqrt{ \Delta R² + \Delta G² + \Delta B² }$
  - **CIELAB**: $|I(x_i) - I(x)| = \sqrt{ \Delta L² + \Delta a² + \Delta b² }$

:::info
In this implementation, both weighting terms are **Gaussian kernels**:

$$
w_{spatial}(d) = \exp!\left(-\frac{d^2}{2\sigma_s^2}\right),
\quad
w_{\text{range}}(d) = \exp!\left(-\frac{d^2}{2\sigma_r^2}\right)
$$

where $ \sigma_s$ controls spatial smoothing and $\sigma_r$ controls edge sensitivity.
:::
## Implementation Details

Our implementation uses a **naive sliding window** approach with **Look-Up Table (LUT) optimizations / "On the Fly" computations** to improve performance.

### 1. Precomputed Look-Up Tables (RGB color space)

Calculating `std::exp()` inside the inner loop is expensive. We precompute the two Gaussian functions:
- **Spatial Weights**: A 2D grid of weights based on the kernel radius. Since the spatial distance between a neighbor and the center never changes, this is calculated once per filter application.
- **Range Weights**: A 1D array mapping squared color distance ($0$ to $255^2 \times 3$) to a weight. This allows O(1) lookups for the "edge preservation" factor.

```cpp title="Precomputing Range Weights"
std::vector<double> range_lut(MAX_RGB_DIST_SQ + 1);
for (int i = 0; i <= MAX_RGB_DIST_SQ; ++i) {
    range_lut[i] = std::exp(-static_cast<double>(i) / two_sigma_range_sq);
}
```

### 2. On-the-fly Range weights (CIE-LAB color space)

When deriving range weights in the CIELAB color space, the LUT approach does not work
(see the [Range Weights section in the implementation docs](../implementation/#range-weights) to understand why).
Instead range weights are computed on the fly using the `gaussian` function.

Since the RGB to CIELAB conversion is expensive, redundant computations are minimized by initially converting the full RGB image to CIELAB image.

In the convolution step LAB distance is computed by reading those values from the CIELAB image buffer, and the gaussian is then evaluated.
```
dL = cie_image[neighbor_idx] - L0;
dA = cie_image[neighbor_idx + 1] - A0;
dB = cie_image[neighbor_idx + 2] - B0;

dist = std::sqrt(dL * dL + dA * dA + dB * dB);
w_range = gaussian(dist, sigma_range);
```

:::note
`gaussian` itself is expensive to run. Future optimizations will include polynomial approximations of `exp(-x^2)` via Taylor expansion or Horner's method.
:::

### 3. The Loop

We iterate over every pixel `(y, x)` and then over every neighbor `(ky, kx)` within the kernel radius:

1.  **Load Neighbor**: Get RGB values of the neighbor.
2.  **Spatial Weight**: Look up precomputed $G_{\sigma_{spatial}}$.
3.  **Range Weight**: Calculate squared color distance $\|C_p - C_q\|^2$ and look up precomputed $G_{\sigma_{range}}$ if using RGB, or compute on the fly if using CIELAB.
4.  **Accumulate**: `pixel_acc += neighbor_rgb * (spatial_w * range_w)`.
5.  **Normalize**: Divide by probability sum.

### Complexity

- **Time Complexity**: $O(W \cdot H \cdot R^2)$, where $R$ is the kernel radius.
- **Space Complexity**: $O(W \cdot H)$ for the output buffer.

This complexity is why the filter can be slow for large radii ($\sigma_{spatial} > 5.0$), but we currently parameterize the radius to be small ($\sigma_{spatial} \leq 3.0$) so it is not a problem.
