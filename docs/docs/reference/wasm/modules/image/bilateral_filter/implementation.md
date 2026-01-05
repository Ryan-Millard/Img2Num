---
id: implementation
title: Bilateral Filter — Implementation details
sidebar_label: Implementation
sidebar_position: 2
---

# Bilateral Filter — Implementation details

This page maps the conceptual steps of the Bilateral Filter to the concrete implementation.

:::important Opacity
The opacity of individual pixels in this implementation are ignored.
:::

## 1. Parameters & Kernel Size

The filter first calculates the kernel size based on the spatial standard deviation ($\sigma_{spatial}$).

```cpp
const int radius = static_cast<int>(std::ceil(SIGMA_RADIUS_FACTOR * sigma_spatial));
const int kernel_width = 2 * radius + 1;
```

We primarily use $\sigma_{spatial} \approx 3.0$, which results in a kernel radius of 9 + the center pixel (width 19x19).

<div style={{ textAlign: 'center' }}>
  <svg
    width="190"
    height="190"
    viewBox="0 0 19 19"
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* background grid */}
    {[...Array(19 * 19)].map((_, i) => {
      const x = i % 19
      const y = Math.floor(i / 19)
      return (
        <rect
          key={i}
          x={x}
          y={y}
          width="1"
          height="1"
          fill="#fff"
          stroke="#000"
          strokeWidth="0.03"
        />
      )
    })}

    {/* radius labels */}
    {[...Array(9)].map((_, r) => (
      <text
        key={r}
        x={10.3 + r}
        y={10}
        fontSize="0.9"
        fill="black"
      >
        {r + 1}
      </text>
    ))}

    {/* spatial support: r=9 + 0.5 to account for center */}
    <circle
      cx="9.5"
      cy="9.5"
      r="9.5"
      fill="rgba(0, 0, 0, 0.5)"
    />

    {/* center pixel */}
    <rect x="9" y="9" width="1" height="1" fill="black" />
  </svg>
</div>

:::important Kernel Dimensions
The filter kernel is always square; width = height = 2 * radius + 1.
:::

## 2. Computing Weights

To avoid computing `std::exp` millions of times per frame, we precompute the spatial and range weights in the RGB color space
and only the spatial weights in the CIELAB color space.

:::note CIELAB Color Space Range Weight Computation
For the CIELAB color space, the range weights are computed "on the fly" to reduce processing time.
:::

:::info
To calculate the weights, we use `gaussian`, a simple Gaussian function that performs the calculation:
$\exp!\left(-\frac{x^2}{2\sigma_{spatial}^2}\right)$

```cpp
double gaussian(double x, double sigma) {
    return std::exp(-(x * x) / (2.0 * sigma * sigma));
}
```
:::

### Spatial Weights (constant per kernel)

The distance pattern is the same for every pixel, so we calculate the distance-based weights once at the start.

```cpp
spatial_weights[(ky + radius) * kernel_diameter + (kx + radius)] = gaussian(dist, sigma_spatial);
```

:::note Similarity Between Color Spaces
Since the color spaces (CIELAB and RGB) represent the **range component** of the image and not the spatial component,
the logic here is the same regardless of the color space (x & y are the spatial component present in every image).
:::

### Range Weights

#### Precomputed RGB Range Weights (LUT)

In the RGB color space, $I(x_i) - I(x)$ is simple (each channel is $[0,255]$), so
we calculate the `similarity score` for every possible color difference ahead of time and store the results in an LUT.
This saves computation time by allowing us to measure the color difference and look up the precomputed weight in the table during the main body of the filter.

```cpp
range_lut[i] = gaussian(static_cast<double>(std::sqrt(i)), sigma_range);
```

:::important LUT Usage
We precompute a lookup table for all possible differences (0–255 for each channel, or squared Euclidean differences 0–195075) in
the RGB color space because it is small enough to store.

See the corresponding information block for CIELAB to see why this differs between the color spaces.
:::

#### "On the Fly" CIELAB Range Weights

In the CIELAB color space, the pixels are not bounded $[0,255]$ per channel like RGB.
Thus, we calculate the `similarity score` for every possible color difference as we need them during the main body of the bilateral filter ("on the fly").

```cpp
w_range = gaussian(dist, sigma_range);
```

:::important "On the fly" vs. LUT
In **CIELAB**, the pixels are not bounded 0–255 per channel in the same way:
- L: $[0,100]$
- a: roughly $[−128,127]$
- b: roughly $[−128,127]$

But more importantly:
1. **Continuous values:** After conversion from RGB, the values are floating-point.
The differences ($|L^*a^*b^* - L^*a^*b^*|^2$) are continuous, not integers.
So the LUT would need to store **all possible floating-point differences**, which is essentially impossible.
2. **Large dynamic range:** The squared Euclidean distance in Lab can be **much larger than in 8-bit RGB**, especially when using floating-point precision.
Precomputing a LUT with sufficient precision would be huge.
3. **Precision matters:** Small errors in range weights in Lab are more noticeable because the filter is very sensitive to perceptual color distances.
A coarse LUT could lead to visible artifacts.
:::

<details open>
<summary>
  <h4>RGB LUT vs CIELAB On-the-Fly Weights</h4>
</summary>

Bilateral filtering computes a **range weight** for each pixel in the kernel based on the color difference between the center pixel and its neighbor.

<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
  <svg
    style={{ width: '100%', maxWidth: '500px' }}
    viewBox="0 0 430 150"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background */}
    <rect x="0" y="0" width="100%" height="100%" fill="#fff" />

    {/* RGB LUT area */}
    <path
      d={(() => {
        const points = Array.from({ length: 101 }, (_, i) => {
          const dx = 10 + i * 3;
          const weight = Math.exp(-(i*i)/(2*20*20)); // sigma_range = 20
          const dy = 60 - weight * 50;
          return `${dx},${dy}`;
        });
        return `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(" ") + ` L310,60 L10,60 Z`;
      })()}
      fill="rgba(255,107,107,0.3)"
      stroke="#ff6b6b"
      strokeWidth="2"
    />

    {/* CIELAB on-the-fly area */}
    <path
      d={(() => {
        const points = Array.from({ length: 101 }, (_, i) => {
          const dx = 10 + i * 3;
          const weight = Math.exp(-(i*i)/(2*15*15)); // sigma_range = 15
          const dy = 120 - weight * 50;
          return `${dx},${dy}`;
        });
        return `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(" ") + ` L310,120 L10,120 Z`;
      })()}
      fill="rgba(77,171,247,0.2)"
      stroke="#4dabf7"
      strokeWidth="2"
    />

    {/* Labels */}
    <text x="200" y="50" fontSize="12" fill="#ff6b6b">RGB LUT</text>
    <text x="200" y="110" fontSize="12" fill="#4dabf7">CIELAB (on-the-fly)</text>

    {/* Axes */}
    <line x1="10" y1="60" x2="310" y2="60" stroke="#000" strokeWidth="0.5" />
    <line x1="10" y1="120" x2="310" y2="120" stroke="#000" strokeWidth="0.5" />
    <text x="320" y="65" fontSize="10">Color difference &Delta;RGB</text>
    <text x="320" y="125" fontSize="10">Color difference &Delta;LAB</text>
  </svg>

  <sub>Above, $\sigma_{r} = 20$ for RGB and $\sigma_{r} = 15$ for CIELAB.</sub>
</div>

##### RGB LUT (Red curve and shaded area)

In the RGB color space, the maximum possible color difference is limited (0–255 per channel).
This allows us to **precompute all possible weights** in a **Lookup Table (LUT)**.
During filtering, we simply **look up the weight** instead of recomputing it with
$\exp!\left(-\frac{x^2}{2\sigma_{spatial}^2}\right)$
for each neighbor.
The discrete nature of the LUT is represented by the shaded area and the curve shows how weight decays with increasing &Delta;RGB.

##### CIELAB (Blue curve and shaded area)
In the CIELAB color space, the number of possible differences is much larger and continuous.
Precomputing a LUT would require enormous memory, so weights are **computed on-the-fly**.
The curve represents the weight for a given color difference &Delta;LAB, and the shaded area illustrates the range of influence.

:::note
This visual shows why RGB weights can be precomputed while CIELAB weights must be computed dynamically.
The **height of the curve/area corresponds to the weight** given by the Gaussian function: higher means more influence in the filtered pixel.
:::

</details>

## 3. Sliding Window Loop

The core processing happens in a nested loop over every pixel $(y, x)$. For each pixel, we:

1. **Iterate** over the window from `-radius` to `+radius` (from left to right inside the effective circular range and domain of the kernel).
2. **Fetch** neighbor RGB values.
3. **Calculate** color difference using squared Euclidean distance.
4. **Lookup weights:**
    - **Spatial weights:** Precomputed at the start of the bilateral filter.
    - **Range weights:**
      - *RGB*: From LUT (precomputed at the start of the bilateral filter).
      - *CIELAB*: Calculate "on the fly".
5. **Accumulate** the weighted sum and the sum of weights.

## 4. Normalization

Finally, we normalize the accumulated color values by the total weight (clamped to valid RGB values: $[0,255]$) to get the filtered pixel value:

```cpp
result[center_idx] = static_cast<uint8_t>(std::clamp(r_acc / weight_acc, 0.0, 255.0));
```

This ensures the pixel brightness remains consistent with the local area.
