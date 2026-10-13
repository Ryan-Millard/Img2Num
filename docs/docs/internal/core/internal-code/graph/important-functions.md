---
title: Important Functions Explained
sidebar_position: 4
---

# Shared Boundary Extraction and Curve Fitting

The current SVG pipeline uses `Graph::compute_contours()` in `core/src/internal/graph.cpp`. It constructs a region-label image after small-region merging and calls `build_shared_loops()` in `core/src/internal/shared_contours.cpp`.

1. **Crack-grid boundaries:** Compare adjacent region labels on the pixel-corner grid to identify boundary segments, rather than tracing through pixel centres.
2. **Canonical shared edges:** Split boundary chains at junctions. Fit each edge once and reuse it for adjacent regions, keeping their borders coincident without an overlap workaround.
3. **Edge smoothing:** Apply five passes of a weighted 1–2–1 average to interior edge points. Edge endpoints and image-border points remain fixed.
4. **Curve fitting:** `fit_curve_reduction()` in `core/src/internal/bezier.cpp` fits quadratic Bézier segments to the smoothed edges.
5. **Region loops:** Assemble fitted edges into loops for each region. `Graph::compute_contours()` stores their curves and region mean colours, and `contoursResultToSVG()` emits individual filled SVG `<path>` elements.

The previous Suzuki–Abe tracer and Savitzky–Golay filter are retained in the source tree but are no longer used by the public SVG conversion path. See [issue #736](https://github.com/Ryan-Millard/Img2Num/issues/736) and [PR #429](https://github.com/Ryan-Millard/Img2Num/pull/429).

---

# Contour Data Structures

This file documents the core data structures used to represent vector boundaries, Bezier curves, and the topological hierarchy of image regions.

## 1. Geometric Primitives

### `struct Point`

A fundamental 2D coordinate representing a position in the image space.

| Member | Type    | Description                                                                                               |
| :----- | :------ | :-------------------------------------------------------------------------------------------------------- |
| `x`    | `float` | Horizontal coordinate (column). Uses `float` to support sub-pixel precision or smooth vector coordinates. |
| `y`    | `float` | Vertical coordinate (row).                                                                                |

### `struct QuadBezier`

Represents a Quadratic Bezier curve segment. This is used when the raw pixel contours are approximated or smoothed into vector paths.

| Member | Type    | Description                                                                                                                        |
| :----- | :------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| `p0`   | `Point` | **Start Point:** The anchor point where the curve begins.                                                                          |
| `p1`   | `Point` | **Control Point:** The handle that determines the curve's tangent and shape. The curve generally does not pass through this point. |
| `p2`   | `Point` | **End Point:** The anchor point where the curve ends.                                                                              |

---

## 2. Contour Results

### `struct ContoursResult`

A container for raw contour points, quadratic Bézier curves, and compatibility topology fields. In the current shared-edge pipeline, `Graph::compute_contours()` sets hierarchy entries to `{-1, -1, -1, -1}` and hole flags to `false`.

#### Member Variables

| Member Variable | Type                         | Description                                                                                                           |
| :-------------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `contours`      | `vector<vector<Point>>`      | A list of contours. `contours[k]` is a vector of `Point`s tracing the boundary of the $k$-th region.                  |
| `curves`        | `vector<vector<QuadBezier>>` | A vectorized representation of `contours`. `curves[k]` contains the Bezier segments approximating the $k$-th contour. |
| `hierarchy`     | `vector<array<int, 4>>`      | Topological tree structure describing how contours nest within each other (see **Hierarchy Structure** below).        |
| `is_hole`       | `vector<bool>`               | Flags the type of border. `true` if `contours[k]` is an internal hole; `false` if it is an external boundary.         |

#### Hierarchy Structure (`std::array<int, 4>`)

The `hierarchy` vector follows the standard structure (compatible with OpenCV) to represent the nesting tree. For the $k$-th contour, `hierarchy[k]` contains:

| Index | Name             | Description                                                                           |
| :---- | :--------------- | :------------------------------------------------------------------------------------ |
| `0`   | **Next Sibling** | Index of the next contour at the same tree level. `-1` if none.                       |
| `1`   | **Prev Sibling** | Index of the previous contour at the same tree level. `-1` if none.                   |
| `2`   | **First Child**  | Index of the first contour nested _inside_ this contour. `-1` if no children.         |
| `3`   | **Parent**       | Index of the contour that surrounds this contour. `-1` if it is a root/frame contour. |

---

## 3. Visual Extension

### `struct ColoredContours`

**Inherits from:** `ContoursResult`

Extends the geometric data with visual attributes, specifically assigning a color to each contour. This is useful for visualization or when contours inherit the color properties of the underlying image nodes.

| Member Variable | Type                         | Description                                                                                           |
| :-------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------- |
| `colors`        | `vector<RGBAPixel<uint8_t>>` | A parallel vector to `contours`. `colors[k]` holds the RGBA color associated with the $k$-th contour. |
