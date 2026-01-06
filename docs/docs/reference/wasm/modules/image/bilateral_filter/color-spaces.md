---
id: color-spaces
title: Color Space Selection — RGB vs CIELAB
sidebar_label: Color Space Selection
sidebar_position: 6
---

# Color Space Selection — RGB vs CIELAB

The bilateral filter in Img2Num supports two color spaces for computing range (color) distances: **RGB** and **CIELAB**. This guide explains the differences, trade-offs, and when to use each.

## Quick Comparison

| Aspect | RGB | CIELAB |
|:---|:---|:---|
| **Perceptual accuracy** | Lower — equal Euclidean distances don't correspond to equal perceived color differences | Higher — designed to be perceptually uniform |
| **Performance** | Faster — uses precomputed LUT | Slower — requires conversion and on-the-fly computation |
| **Edge preservation** | Good for most images | Better for images with subtle color transitions |
| **Best for** | General purpose, real-time applications | High-quality processing, perceptual accuracy |

## When to Use Each Color Space

### Use RGB when:
- **Performance is critical** — RGB processing is significantly faster due to LUT optimization
- **Working with high-contrast images** — where edge preservation is less sensitive to color space choice
- **Real-time processing** — where milliseconds matter
- **Sigma_range values are well-tuned** — and visual results are satisfactory

### Use CIELAB when:
- **Perceptual uniformity matters** — you want visually equal smoothing across different hues
- **Working with skin tones or subtle gradients** — where human perception is sensitive
- **Quality over speed** — when processing time is less critical than output quality
- **Processing medical or scientific imagery** — where perceptual accuracy is important

## Mathematical Differences

### Distance Metrics

Both color spaces compute the Euclidean distance between color vectors, but the ranges differ significantly.

#### RGB Color Space
RGB channels are bounded `[0, 255]` per channel:

$$
\text{distance}_{\text{RGB}} = \sqrt{\Delta R^2 + \Delta G^2 + \Delta B^2}
$$

Maximum possible distance:
$$
\text{max}_{\text{RGB}} = \sqrt{255^2 + 255^2 + 255^2} \approx 441.67
$$

#### CIELAB Color Space
CIELAB channels have different ranges:
- **L\***: `[0, 100]` (lightness)
- **a\***: approximately `[-128, 127]` (green-red)
- **b\***: approximately `[-128, 127]` (blue-yellow)

$$
\text{distance}_{\text{LAB}} = \sqrt{\Delta L^2 + \Delta a^2 + \Delta b^2}
$$

Maximum theoretical distance:
$$
\text{max}_{\text{LAB}} = \sqrt{100^2 + 255^2 + 255^2} \approx 373.56
$$

:::important Key Insight
In practice, most real-world pixel differences are **much smaller** than the maximum possible distance. CIELAB distances for neighboring pixels are typically smaller than RGB distances due to:
1. **Numerical compression** from the RGB→LAB conversion
2. **Perceptual scaling** — LAB is designed to reflect human vision, which perceives smaller differences
:::

## Sigma_range Behavior Differences

The `sigma_range` parameter controls edge preservation by weighting color similarity. However, the same `sigma_range` value produces **different visual results** in RGB vs CIELAB.

### The Range Weight Formula

The bilateral filter computes range weights using a Gaussian:

$$
w_{\text{range}} = \exp\left(-\frac{\text{distance}^2}{2\sigma_{\text{range}}^2}\right)
$$

- When distance is **small**, weight is **high** (≈1) → strong contribution
- When distance is **large**, weight is **low** (≈0) → weak contribution

### Why the Same Sigma Produces Different Results

import RgbVsLabRangeKernel from '@site/src/components/docs/reference/wasm/modules/image/bilateral_filter/RgbVsLabRangeKernel';

<RgbVsLabRangeKernel />

**With `sigma_range = 50`**:
- **RGB**: Typical neighboring pixel distances are small relative to 50, so many neighbors contribute significantly → **moderate blur**
- **CIELAB**: Typical neighboring pixel distances are even smaller, so almost all neighbors contribute strongly → **stronger blur**

### Sigma_range Scaling for Visual Consistency

To achieve **visually similar** blur between RGB and CIELAB, you can scale `sigma_range`:

```javascript
// Example: Scaling RGB sigma_range to match CIELAB visual output
const sigma_range_base = 50.0; // Target CIELAB sigma_range

let sigma_range_actual;
if (color_space === COLOR_SPACE_RGB) {
    // Scale RGB sigma_range to match CIELAB perceptually
    sigma_range_actual = sigma_range_base * 4.18;
} else {
    sigma_range_actual = sigma_range_base;
}
```

:::important Scaling Factor
The scaling factor of **~4.18** is empirically derived and works well for natural images. However:
- It's **not universal** — depends on image statistics
- It's **not mandatory** — the different behaviors are valid features of each color space
- **Advanced users** may want different sigma_range values for each space
:::

### Visual Example

Using the same `sigma_range = 50`:

| Color Space | Visual Result |
|:---|:---|
| **CIELAB** | Stronger smoothing, better edge preservation in perceptually uniform manner |
| **RGB** | Moderate smoothing, adequate edge preservation for most use cases |
| **RGB (scaled)** | Similar smoothing to CIELAB when `sigma_range ≈ 209` |

## Performance Considerations

### RGB Performance
- **Precomputed LUT**: All 195,075 possible squared distances are precomputed
- **O(1) lookup**: Range weight retrieval is extremely fast
- **Memory**: ~1.5 MB for LUT (acceptable for most applications)

### CIELAB Performance
- **Full image conversion**: RGB→LAB conversion for entire image upfront
- **On-the-fly computation**: Range weights computed using `exp()` for each neighbor
- **Slower but optimized**: Conversion is done once; only distance calculation repeated

**Performance Impact**: CIELAB is typically **2-4× slower** than RGB, depending on image size and kernel radius.

:::tip Optimization Note
Future optimizations may include:
- Taylor/Horner polynomial approximations for `exp(-x²)`
- SIMD vectorization for distance calculations
- Adaptive LUT for CIELAB (with quantization)
:::

## Implementation Details

### RGB Range Weights (LUT)
```cpp
// Precompute all possible RGB distances
std::vector<double> range_lut(MAX_RGB_DIST_SQ + 1);
for (int i = 0; i <= MAX_RGB_DIST_SQ; ++i) {
    range_lut[i] = gaussian(std::sqrt(i), sigma_range);
}

// Later, during filtering:
const int dr = r_neighbor - r_center;
const int dg = g_neighbor - g_center;
const int db = b_neighbor - b_center;
const int dist_sq = dr*dr + dg*dg + db*db;
double w_range = range_lut[dist_sq]; // O(1) lookup
```

### CIELAB Range Weights (On-the-fly)
```cpp
// Precompute full-image RGB → LAB conversion
std::vector<double> cie_image(width * height * 4);
for (each pixel) {
    rgb_to_lab(r, g, b, L, A, B);
    cie_image[idx] = L; cie_image[idx+1] = A; cie_image[idx+2] = B;
}

// Later, during filtering:
double dL = L_neighbor - L_center;
double dA = A_neighbor - A_center;
double dB = B_neighbor - B_center;
double dist = std::sqrt(dL*dL + dA*dA + dB*dB);
double w_range = gaussian(dist, sigma_range); // Computed on-the-fly
```

## Recommendations

### Default Choice
For most applications, **RGB** is the recommended default:
- ✅ Faster processing
- ✅ Good results for general images
- ✅ Predictable behavior

### When to Switch to CIELAB
Consider CIELAB when you observe:
- Inconsistent smoothing across different hues
- Need for perceptually uniform processing
- Working with images where color accuracy is critical
- Willing to accept 2-4× performance cost

### Parameter Tuning

**Starting values**:
- `sigma_spatial = 3.0` (both color spaces)
- `sigma_range = 50.0` (CIELAB) or `sigma_range = 200.0` (RGB for similar visual effect)

**Adjustment guidelines**:
- Increase `sigma_range` → more blur, less edge preservation
- Decrease `sigma_range` → sharper edges, less smoothing
- Test with your specific images — optimal values vary by content

## See Also

- [Implementation Details](./implementation.md#range-weights) — Deep dive into LUT vs on-the-fly computation
- [API Reference](./api.md) — `color_space` parameter documentation
- [Keywords](./keywords.md) — Understanding range and spatial components
