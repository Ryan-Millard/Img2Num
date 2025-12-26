---
id: complexity-and-memory
title: Complexity and Memory
sidebar_label: Complexity and Memory
sidebar_position: 6
description: A breakdown of the time complexity, memory usage, and cache behavior of the mergeSmallRegionsInPlace function.
---

$$
\text{Let } N = width \times height
$$

## Time
The flood-fill visits each pixel once and tests 4 neighbours ($$4 \cdot N$$), so the dominant cost is $$O(N)$$ with a small constant
(neighbour checks and byte comparisons). The merge pass is another similar $$O(N)$$ scan, so overall $$O(N)$$.

## Memory
The implementation allocates a `labels` array of $N$ integers and a `regions` vector whose size equals number of components
(at most $$N$$). So memory is $$O(N)$$ additional to the image buffer.

## Cache behaviour
BFS queue can cause random access inside large components; using a scanline two-pass connected-component algorithm (or union-find) can improve cache locality and throughput on big images.
