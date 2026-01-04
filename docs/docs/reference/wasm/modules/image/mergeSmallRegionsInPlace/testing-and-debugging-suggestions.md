---
id: testing-and-debugging-suggestions
title: Testing & Debugging Suggestions
sidebar_label: Testing & Debugging Suggestions
sidebar_position: 9
description: Testing and debugging suggestions for the mergeSmallRegionsInPlace function.
---

## Synthetic test images

Create synthetic test images that exercise corner cases:

- Single pixel islands
- Long 1-pixel-wide arms (test minWidth/minHeight)
- Two large regions separated by thin small islands
- Diagonal-touching shapes (to test 4 vs 8 connectivity)

## Visualization of labels map

Visualize the `labels` map (map labels to colors) to ensure connected components are being formed as expected.

## Unit tests

Assert that the number of pixels of a known large blob is unchanged; assert that small isolated pixels have been recolored.

## Instrumentation

Collect histogram of region sizes to choose appropriate `minArea`.
