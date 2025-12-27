---
id: faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 10
description: Frequently asked questions related to the mergeSmallRegionsInPlace function.
---

# Frequently Asked Questions

## What problem does `mergeSmallRegionsInPlace` solve?

This function removes **tiny connected regions** in an RGBA image by merging them into neighboring, sufficiently large regions **in-place**.

It is intended for post-processing steps after:
- k-means color quantization
- segmentation

Or as a pre-processing step before:
- image-to-vector (SVG) pipelines

Small regions often appear as visual noise and make downstream geometry extraction harder.

## What exactly is a “region” in this context?
A **region** is a *4-connected component* of pixels where:
- Each pixel is connected via **up, down, left, or right**
- All pixels have **exactly the same RGBA values**

Diagonal adjacency **does not** count.

## Why use 4-connectivity instead of 8-connectivity?
4-connectivity:
- Matches most raster algorithms (flood-fill, contour tracing)
- Avoids diagonal “corner-touch” artifacts
- Produces cleaner, grid-aligned regions

Using 8-connectivity would merge diagonally touching pixels that visually are not part of the same region.

## Why is the image indexed as `idx(x, y, width) * 4`?

Each pixel consists of **4 bytes**: `R`, `G`, `B`, `A`

So the linear index into the pixel buffer is:

$$
(\text{y} \cdot \text{width} + \text{x}) \times 4
$$

<details>
<summary>Visual Example: 5×5 RGBA Image Indexing</summary>

<svg width="300" height="340" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="320" height="340" fill="#eeeeee" />

  <!-- Row 0 -->
  <rect x="0" y="0" width="60" height="60" fill="#ffd6d6" stroke="#000"/>
  <text x="30" y="35" font-size="8" text-anchor="middle" alignment-baseline="middle">(0,0) idx*4=0</text>

  <rect x="60" y="0" width="60" height="60" fill="#d6ffd6" stroke="#000"/>
  <text x="90" y="35" font-size="8" text-anchor="middle" alignment-baseline="middle">(1,0) idx*4=4</text>

  <rect x="120" y="0" width="60" height="60" fill="#d6d6ff" stroke="#000"/>
  <text x="150" y="35" font-size="8" text-anchor="middle" alignment-baseline="middle">(2,0) idx*4=8</text>

  <rect x="180" y="0" width="60" height="60" fill="#fff0d6" stroke="#000"/>
  <text x="210" y="35" font-size="8" text-anchor="middle" alignment-baseline="middle">(3,0) idx*4=12</text>

  <rect x="240" y="0" width="60" height="60" fill="#ffd6ff" stroke="#000"/>
  <text x="270" y="35" font-size="8" text-anchor="middle" alignment-baseline="middle">(4,0) idx*4=16</text>

  <!-- Row 1 -->
  <rect x="0" y="60" width="60" height="60" fill="#d6ffd6" stroke="#000"/>
  <text x="30" y="95" font-size="8" text-anchor="middle" alignment-baseline="middle">(0,1) idx*4=20</text>

  <rect x="60" y="60" width="60" height="60" fill="#d6d6ff" stroke="#000"/>
  <text x="90" y="95" font-size="8" text-anchor="middle" alignment-baseline="middle">(1,1) idx*4=24</text>

  <rect x="120" y="60" width="60" height="60" fill="#fff0d6" stroke="#000"/>
  <text x="150" y="95" font-size="8" text-anchor="middle" alignment-baseline="middle">(2,1) idx*4=28</text>

  <rect x="180" y="60" width="60" height="60" fill="#ffd6ff" stroke="#000"/>
  <text x="210" y="95" font-size="8" text-anchor="middle" alignment-baseline="middle">(3,1) idx*4=32</text>

  <rect x="240" y="60" width="60" height="60" fill="#ffd6d6" stroke="#000"/>
  <text x="270" y="95" font-size="8" text-anchor="middle" alignment-baseline="middle">(4,1) idx*4=36</text>

  <!-- Row 2 -->
  <rect x="0" y="120" width="60" height="60" fill="#d6d6ff" stroke="#000"/>
  <text x="30" y="155" font-size="8" text-anchor="middle" alignment-baseline="middle">(0,2) idx*4=40</text>

  <rect x="60" y="120" width="60" height="60" fill="#fff0d6" stroke="#000"/>
  <text x="90" y="155" font-size="8" text-anchor="middle" alignment-baseline="middle">(1,2) idx*4=44</text>

  <rect x="120" y="120" width="60" height="60" fill="#ffd6ff" stroke="#000"/>
  <text x="150" y="155" font-size="8" text-anchor="middle" alignment-baseline="middle">(2,2) idx*4=48</text>

  <rect x="180" y="120" width="60" height="60" fill="#ffd6d6" stroke="#000"/>
  <text x="210" y="155" font-size="8" text-anchor="middle" alignment-baseline="middle">(3,2) idx*4=52</text>

  <rect x="240" y="120" width="60" height="60" fill="#d6ffd6" stroke="#000"/>
  <text x="270" y="155" font-size="8" text-anchor="middle" alignment-baseline="middle">(4,2) idx*4=56</text>

  <!-- Row 3 -->
  <rect x="0" y="180" width="60" height="60" fill="#fff0d6" stroke="#000"/>
  <text x="30" y="215" font-size="8" text-anchor="middle" alignment-baseline="middle">(0,3) idx*4=60</text>

  <rect x="60" y="180" width="60" height="60" fill="#ffd6ff" stroke="#000"/>
  <text x="90" y="215" font-size="8" text-anchor="middle" alignment-baseline="middle">(1,3) idx*4=64</text>

  <rect x="120" y="180" width="60" height="60" fill="#ffd6d6" stroke="#000"/>
  <text x="150" y="215" font-size="8" text-anchor="middle" alignment-baseline="middle">(2,3) idx*4=68</text>

  <rect x="180" y="180" width="60" height="60" fill="#d6ffd6" stroke="#000"/>
  <text x="210" y="215" font-size="8" text-anchor="middle" alignment-baseline="middle">(3,3) idx*4=72</text>

  <rect x="240" y="180" width="60" height="60" fill="#d6d6ff" stroke="#000"/>
  <text x="270" y="215" font-size="8" text-anchor="middle" alignment-baseline="middle">(4,3) idx*4=76</text>

  <!-- Row 4 -->
  <rect x="0" y="240" width="60" height="60" fill="#ffd6ff" stroke="#000"/>
  <text x="30" y="275" font-size="8" text-anchor="middle" alignment-baseline="middle">(0,4) idx*4=80</text>

  <rect x="60" y="240" width="60" height="60" fill="#ffd6d6" stroke="#000"/>
  <text x="90" y="275" font-size="8" text-anchor="middle" alignment-baseline="middle">(1,4) idx*4=84</text>

  <rect x="120" y="240" width="60" height="60" fill="#d6ffd6" stroke="#000"/>
  <text x="150" y="275" font-size="8" text-anchor="middle" alignment-baseline="middle">(2,4) idx*4=88</text>

  <rect x="180" y="240" width="60" height="60" fill="#d6d6ff" stroke="#000"/>
  <text x="210" y="275" font-size="8" text-anchor="middle" alignment-baseline="middle">(3,4) idx*4=92</text>

  <rect x="240" y="240" width="60" height="60" fill="#fff0d6" stroke="#000"/>
  <text x="270" y="275" font-size="8" text-anchor="middle" alignment-baseline="middle">(4,4) idx*4=96</text>

  <!-- Explanation -->
  <text x="80" y="320" font-size="10">Each pixel = 4 bytes (R,G,B,A)</text>
  <text x="80" y="335" font-size="10">Byte offset = idx(x,y,width) * 4</text>
</svg>

</details>

:::note Assumptions this layout has
- Row-major order
- No padding between rows
:::

## What does `sameColor(...)` check?

It compares **all four RGBA channels** for equality:

- Red
- Green
- Blue
- Alpha

Two pixels are considered connected **only if all channels match exactly**.

This is important for correctness when alpha is meaningful (e.g. transparency).

## Why does the algorithm do two passes?

The function is split into **two distinct phases**:

1. **Labeling pass**
   - Flood-fills each region
   - Assigns a label to every pixel
   - Computes region metadata (area + bounding box)

2. **Merge pass**
   - Iterates pixels again
   - Replaces pixels belonging to “small” regions
   - Copies color from a neighboring “big enough” region

This separation keeps the logic simpler and avoids modifying regions while still discovering them.

## What makes a region “big enough”?

A region must satisfy **all three** conditions:

- `size >= minArea`
- `width() >= minWidth`
- `height() >= minHeight`

Where:
- `size` = number of pixels
- `width()` = bounding box width
- `height()` = bounding box height

This prevents:
- Thin lines
- Long but narrow artifacts
- Small blobs

## Why use a bounding box instead of checking shape quality?

Bounding boxes are:
- Fast to compute
- Memory cheap
- Conservative

They don’t capture holes or concavities, but they are a good heuristic for filtering obvious noise.

There is a TODO noting that **internal gaps** could reduce effective width/height even if the bounding box looks valid.

## Can a region pass the bounding box test but still be “bad”?

Yes.

Example:
- A hollow ring
- A U-shaped region
- A region with internal gaps

The bounding box may be large, but the actual filled area might be sparse.

This implementation prioritizes speed and simplicity over perfect geometric validity.

## Why are regions merged pixel-by-pixel instead of as a whole?

Because:
- The function operates **in-place**
- It avoids reallocating buffers
- It keeps memory usage predictable

Each pixel independently:
- Checks its neighbors
- Copies the color of a valid region

This makes the merge phase linear and simple.

## Why only check immediate neighbors during merging?

Only **4 immediate neighbors** are checked because:
- The merge should respect spatial adjacency
- Copying from distant pixels could create visual artifacts

This ensures merges look natural and locally consistent.

## What happens if a small region has no big neighbors?

Nothing.

Pixels in that region remain unchanged.

This avoids:
- Arbitrary color assignment
- Unexpected long-range merges

If this is undesirable, a second pass or fallback strategy can be added.

## Does this update region metadata after merging?

No.

Once the merge phase starts:
- `regions` is treated as read-only
- Labels may change per pixel
- Region sizes are **not recomputed**

This is intentional to keep runtime linear and avoid cascading changes.

## What is the time complexity?

Overall complexity is **linear**:

- Flood-fill labeling: $O(n)$
- Merge pass: $O(n)$

Where $$ n = \text{width} \times \text{height} $$

Each pixel is:
- Visited once in flood-fill
- Checked against at most 4 neighbors

## What is the memory overhead?

Additional memory used:
- `labels`: one `int` per pixel
- `regions`: one entry per connected component
- BFS queue (temporary)

No additional image buffers are allocated.

## Why use BFS (`std::queue`) instead of DFS?

BFS:
- Avoids deep recursion
- Prevents stack overflow on large regions
- Has predictable memory usage

DFS would require either recursion (unsafe) or an explicit stack (no advantage here).

## Can this function be parallelized?

Not easily in its current form.

Reasons:
- Flood-fill has data dependencies
- Label assignment is sequential
- Merge step mutates shared data

Parallel versions would require:
- Tiled processing
- Boundary reconciliation
- More complex region merging logic

## Is this suitable for SVG generation pipelines?

Yes — especially as a **cleanup step** before:
- Boundary tracing
- Polygon extraction
- Path simplification

Removing small regions early greatly simplifies vector geometry later.

## What are common improvements or extensions?

Possible enhancements include:
- Detecting holes inside regions

   <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
     <!-- Outer region -->
     <rect x="10" y="10" width="100" height="100" fill="#ffd6d6" stroke="#000"/>
     <!-- Hole -->
     <rect x="40" y="40" width="40" height="40" fill="#ffffff" stroke="#000" stroke-dasharray="4"/>
   </svg>

- Merging based on color similarity instead of equality

  <svg width="180" height="60" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="60" height="60" fill="#ffaaaa" stroke="#000"/>
    <rect x="60" y="0" width="60" height="60" fill="#ff9999" stroke="#000"/>
    <rect x="120" y="0" width="60" height="60" fill="#ff8888" stroke="#000"/>
  </svg>

- Multi-pass merging
- Choosing the *largest neighboring region* instead of the first valid one
- Detecting localised width/height - regions often have large tentacle-like protrusions.

The current design favors **clarity and predictability** over heuristics.

## Is this function deterministic?

Yes.

Given the same input image and parameters, the output is always identical.

No randomness is involved.

## When should I *not* use this?

Avoid this function if:
- You need exact topology preservation
- You rely on diagonal connectivity
- You require sub-pixel or fuzzy color matching

It is designed for **grid-aligned, exact-color regions**.

# Summary

`mergeSmallRegionsInPlace` is a fast, predictable cleanup step for raster segmentation pipelines.  
It trades geometric perfection for simplicity, performance, and ease of reasoning — which is often exactly what you want before vectorization.
