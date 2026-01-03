---
id: implementation
title: Bilateral Filter — Implementation details
sidebar_label: Implementation
sidebar_position: 4
---

# Bilateral Filter — Implementation details

This page maps the conceptual steps of the Bilateral Filter to the concrete functions and loops in the implementation.

## 1. Parameters & Window Size

The filter first calculates the kernel size based on the spatial standard deviation ($\sigma_{spatial}$).

```cpp
const int radius = static_cast<int>(std::ceil(SIGMA_RADIUS_FACTOR * sigma_spatial));
const int kernel_width = 2 * radius + 1;
```

We primarily use $\sigma_{spatial} \approx 3.0$, which results in a kernel radius of 9 (width 19x19).

## 2. Precomputing Weights (Optimization)

To avoid computing `std::exp` millions of times per frame, we precalculate the weights.

### Spatial Weights (constant per kernel)
The distance pattern is the same for every pixel, so we calculate the distance-based weights once at the start.

```cpp
spatial_weights[(ky + radius) * kernel_width + (kx + radius)] =
    std::exp(-dist2 / two_sigma_space_sq);
```

### Range Weights (LUT)
We calculate the `similarity score` for every possible color difference ahead of time. We just measure the color difference and look up the precomputed weight in the table.

```cpp
for (int i = 0; i <= MAX_RGB_DIST_SQ; ++i) {
    range_lut[i] = std::exp(-static_cast<double>(i) / two_sigma_range_sq);
}
```

## 3. Sliding Window Loop

The core processing happens in a nested loop over every pixel $(y, x)$. For each pixel, we:

1.  **Iterate** over the window (from $-radius$ to $+radius$).
2.  **Fetch** neighbor RGB values.
3.  **Calculate** color difference (squared Euclidean distance).
4.  **Lookup** spatial weight (from array) and range weight (from LUT).
5.  **Accumulate** the weighted sum and the sum of weights.

```cpp
double w_space = spatial_weights[...];
double w_range = range_lut[dist_sq];
double w = w_space * w_range;

r_acc += r * w;
g_acc += g * w;
b_acc += b * w;
weight_acc += w;
```

## 4. Normalization

Finally, we normalize the accumulated color values by the total weight to get the filtered pixel value:

```cpp
result[center_idx] = static_cast<uint8_t>(std::clamp(r_acc / weight_acc, 0.0, 255.0));
```

This ensures the pixel brightness remains consistent with the local area.
