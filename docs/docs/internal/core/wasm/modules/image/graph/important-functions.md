---
title: Important Functions Explained
sidebar_position: 4
---

Nodes are responsible in computing their own contours using the Suzuki-Abe method.

# Suzuki-Abe Contour Tracing Algorithm

**Reference:** _Suzuki, S. and Abe, K., "Topological Structural Analysis of Digitized Binary Images by Border Following", CVGIP 30 1, pp 32-46 (1985)_

The Suzuki-Abe algorithm is a border-following technique designed to extract the topological structure of binary images. Unlike simple boundary tracing, it produces two distinct outputs:

1.  **Contours:** Vector lists of point coordinates representing the borders.
2.  **Hierarchy:** A tree structure indicating the relationship between borders (e.g., is a border an external outline or a hole inside another shape?).

---

## Key Concepts

### 1. Border Types

The algorithm distinguishes between two types of borders based on the transition between 0 (background) and 1 (foreground) pixels:

- **Outer Border:** The boundary between a background region and a foreground component (surrounded by background).
- **Hole Border:** The boundary between a foreground component and an internal background hole (surrounded by foreground).

### 2. Tracking Variables

- **`f[i,j]`**: The value of the pixel at row `i`, column `j`. Initially, the image contains only `0` (background) and `1` (foreground). As the algorithm runs, `1`s are replaced by unique Border IDs.
- **`NBD` (Number of Border)**: A counter representing the current Border ID being assigned. Starts at `2` (since `1` is used for raw foreground).
- **`LNBD` (Last Number of Border)**: Tracks the Border ID of the most recently visited border during the raster scan. This acts as the "Parent" tracker.

---

## The Algorithm Steps

The algorithm combines a **Raster Scan** (to find new borders) with a **Border Following** routine (to trace and mark the entire boundary once found).

### Phase 1: Raster Scan

Iterate through the image row by row, from top-left to bottom-right.

1.  **Reset `LNBD`:** At the start of every row, reset `LNBD = 1` (frame ID).
2.  **Check Pixel `f[i,j]`:**
    - **Case A (Outer Border Start):** If `f[i,j] == 1` and `f[i, j-1] == 0` (transition from empty space to object):
      - Increment `NBD`.
      - This is a new **Outer Border**.
      - Update Hierarchy: `LNBD` is the parent of `NBD`.
      - **Trigger Phase 2 (Trace Border)** starting at `(i,j)`.
    - **Case B (Hole Border Start):** If `f[i,j] >= 1` and `f[i, j+1] == 0` (transition from object to empty space):
      - Increment `NBD`.
      - This is a new **Hole Border**.
      - Update Hierarchy: `LNBD` is the parent of `NBD`. (If `f[i,j] > 1`, set `LNBD = f[i,j]` first).
      - **Trigger Phase 2 (Trace Border)** starting at `(i,j)`.
    - **Case C (Non-Border):** If neither A nor B, update `LNBD` if `f[i,j] != 0` and continue scanning.

### Phase 2: Border Following (The "Turtle" Logic)

Once a starting pixel `(x, y)` is found, trace the connected edge pixels until returning to the start.

1.  **Search Neighborhood:** Starting from the previous pixel (or a default direction), check the 8-connected (or 4-connected) neighbors in a **Clockwise** (or Counter-Clockwise) direction.
2.  **Find Next Pixel:** The first non-zero pixel found becomes the next current pixel.
3.  **Mark Pixel:** Change the value of the current pixel in the image to `NBD` (or `-NBD` in specific cases to mark visited edges without destroying topology).
    - _Note: This modification prevents the Raster Scan from re-detecting the same border later._
4.  **Record Coordinate:** Add the pixel `(x, y)` to the current contour vector.
5.  **Termination:** Stop when the tracer returns to the **Starting Point** AND matches the **Starting Direction**.

---

## Hierarchy Tree Structure

The algorithm maintains a hierarchy table (often stored as an `std::array<int, 4>` : `[Next, Previous, First_Child, Parent]`).

| Topology   | Description                                            |
| :--------- | :----------------------------------------------------- |
| **Root**   | The image frame (background).                          |
| **Parent** | The border immediately surrounding the current one.    |
| **Child**  | A border immediately contained within the current one. |

**Example Hierarchy:**

1.  **Outer Box (ID 2)** -> Parent: Frame.
2.  **Inner Hole (ID 3)** -> Parent: ID 2.
3.  **Island inside Hole (ID 4)** -> Parent: ID 3.

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

The primary container for the output of the contour extraction algorithm (e.g., Suzuki-Abe). It separates the raw pixel data from the topological relationship data.

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
