---
id: overview
title: mergeSmallRegionsInPlace — Overview
sidebar_label: Overview
sidebar_position: 2
---

This page documents the algorithm, the math and topology behind the mergeSmallRegionsInPlace function,
the provided implementation, usage examples, complexity, limitations, and suggested improvements.

## Why this exists

Small spurious pixel clusters (`"speckles"` or thin "arms") are common after colour quantization, k-means-based color clustering,
thresholding, or other segmentation steps. They make vectorization (e.g. converting raster -> SVG)
and any downstream shape-based processing noisy.
This routine cleans those small clusters by merging them into neighboring, larger regions so the image looks cleaner and shapes are more blob-like.

Think of it as a domain-specific `despeckle` that uses connected-component analysis and a simple adjacency-based merge rule.

The merge rule is important as it avoids leaving gaps in the image (a problem faced by several other similar libraries).

## When to use it

- With an RGBA image stored in a tightly-packed `uint8_t*` pixels buffer (4 bytes per pixel, row-major).
- To remove very small connected components while preserving large components.
- You are OK with replacing a small-region pixel by the color of an *adjacent* large region.

:::important
Not suitable when you need to preserve small but semantically important details (e.g. text strokes),
or when color matching should be fuzzy (this implementation checks exact RGBA equality).
:::

## Function signature & API

```cpp
void mergeSmallRegionsInPlace(
    uint8_t *pixels, // pointer to RGBA buffer, length = width * height * 4
    int width,       // image's width
    int height,      // image's height
    int minArea,     // minimum pixel count for a region to be "big enough"
    int minWidth,    // minimum bounding-box width for a region to be "big enough"
    int minHeight    // minimum bounding-box height for a region to be "big enough"
);
```

### Parameters

- `pixels` — row-major RGBA buffer with 4 bytes per pixel:

$$
\text{pixels} = [ \overbrace{255}^{R},\overbrace{255}^{G},\overbrace{255}^{B},\overbrace{255}^{A}, \overbrace{0}^{R},\overbrace{0}^{G},\overbrace{0}^{B},\overbrace{255}^{A}, \cdots ]
$$

- `width`, `height` — image dimensions in pixels.
- Evaluation Criteria:
  - `minArea` — threshold on the number of pixels in a connected component; components with `size < minArea` are considered too small.
  - `minWidth`, `minHeight` — thresholds on the component's bounding-box width/height. A component is considered big enough when **all three** conditions pass (area and both bbox dimensions). This helps avoid long thin components being considered large just by area.

### Preconditions

* `pixels != nullptr` and `width>0` and `height>0`.
* The buffer length must be at least `width * height * 4` bytes.

### Postconditions

* The `pixels` buffer may be modified in-place: small regions will have their pixels recolored to match an adjacent large region (if found).
* The function uses an internal label map and region metadata; it does not return labels.
