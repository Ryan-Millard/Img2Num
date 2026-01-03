---
id: limitations-and-pitfalls
title: Limitations & Pitfalls
sidebar_label: Limitations & Pitfalls
sidebar_position: 7
description: Limitations and pitfalls commonly encountered when using the mergeSmallRegionsInPlace function.
---

## Exact RGBA equality

The algorithm treats colors as equal only when all 4 bytes match exactly.
If you need fuzzy color merging (e.g. colors within a Euclidean distance in RGB), you must replace `sameColor` with a colour-distance test.
:::note Extending functionality
This could be extended in the future by allowing callers to pass a custom equality-checker function.
:::

## Only 4-connectivity

Components connected only diagonally will be considered separate. If your semantics require 8-connectivity, adapt the neighbour set.

## Local merge heuristic

A small region is colored using the first adjacent large neighbour encountered.
If a small island touches multiple large regions, the chosen one depends on neighbour scan order
(right, left, down, up in the reference code). This can occasionally lead to confusion as it is not an `intelligent check`.

## Holes / concavities

The bounding-box test may be fooled by shapes with large bounding boxes but containing many holes.
**The TODO in the source code remains valid**: you could compute convex-hull, morphological closing,
or compute the ratio `size / (width*height)` (occupancy) to detect sparse shapes.

```cpp title="The TODO comment"
// TODO: check for gaps inside regions - its possible their dimensions are fine,
// but inner gaps reduce effective width and height
```

## Order sensitivity

Since pixels are recolored in place and have their `labels` updated when a merge is done,
subsequent small pixels that were adjacent to that pixel may now see a different neighbour label;
this actually helps the merge flood (small pixels adjacent to a merged pixel can be recoloured to the same large region),
but it means the behaviour is implementation-order dependent.

## Performance

Allocation of `std::vector<int>` and `std::queue` can be optimized for very large images.
