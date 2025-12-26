---
id: variants-and-improvements
title: Variants & Improvements
sidebar_label: Variants & Improvements
sidebar_position: 8
description: Several ways mergeSmallRegionsInPlace could be improved or customized.
---

This section explains several ways to improve or customize the behavior of `mergeSmallRegionsInPlace`.

:::tip Limitations & Pitfalls
Also see the previous section, [Limitations & Pitfalls](../limitations-and-pitfalls), for a better understanding of the below.
:::

## 8-connectivity

Change the neighbor offsets from 4 to 8 directions (include diagonals). This connects diagonally touching pixels.

## Two-pass connected-component

> A.K.A. scanline or union-find labeling

A two-pass algorithm is usually faster (lower memory footprint and better cache locality).
It scans rows, assigns provisional labels and records equivalences, then resolves equivalences and computes final region stats in the second pass.

## Use colour distance instead of exact equality

```cpp title="Replace sameColor with something like the below"
inline bool similarColor(const uint8_t *img, int w, int h, int x1, int y1, int x2, int y2, int tol) {
  int i1 = idx(x1,y1,w)*4; int i2 = idx(x2,y2,w)*4;
  int dr = int(img[i1]) - img[i2];
  int dg = int(img[i1+1]) - img[i2+1];
  int db = int(img[i1+2]) - img[i2+2];
  return (dr*dr + dg*dg + db*db) <= tol*tol;
}
```

This treats colors within `tol` distance as identical.

## Merge-by-nearest-large-region (instead of neighbour sampling)

For each small region, find the nearest big region (e.g. by computing region adjacency graph or distance transform)
and recolor the whole small region at once. This reduces order dependence and makes merging decisions global.

## Use morphological operations to fill small gaps

Applying a morphological closing (dilate then erode) before connected-component labeling can fill thin gaps and reduce speckles without per-component heuristics.

## Occupancy / solidity test

Compute $solidity = \frac{size}{width \times height}$

If `solidity` is low (i.e., bounding box large but region sparse), treat as small/noisy and merge.

## Parallel labeling

Use segmented image tiling with boundary stitching for multicore scaling or specialized GPU approaches.

