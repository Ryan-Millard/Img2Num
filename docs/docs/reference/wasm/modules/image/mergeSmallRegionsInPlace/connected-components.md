---
id: connected-components
title: Connected Components & Small Region Merging
sidebar_label: Connected Components
sidebar_position: 3
description: >
  Step-by-step explanation of the connected-component labeling algorithm (mergeSmallRegionsInPlace) with flood-fill,
  small-region removal, and merging into larger neighboring regions. Includes mathematical background and visual examples.
---

## High-Level Algorithm

1. **Labeling / connected-component flood-fill**: iterate pixels, perform a breadth-first (queue) flood-fill
whenever an unlabeled pixel is found. Two pixels are considered connected if they are 4-neighbours (up, down, left, right)
and their RGBA values are exactly equal.
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap:"4px" }}>
  <div style={{ display: "grid", }}>
    <div style={{ display: "flex", gap: "4px" }}>
      <div style={{ width: "15px", height: "15px", margin: "auto 0", backgroundColor: "#1f77b4", border: "1px solid #000" }} />
      <span>Center pixel (being flood-filled)</span>
    </div>
    <div style={{ display: "flex", gap: "4px" }}>
      <div style={{ width: "15px", height: "15px", margin: "auto 0", backgroundColor: "#ccc", border: "1px solid #000" }} />
      <span>Other pixels (unlabeled neighbor candidates)</span>
    </div>
    <div style={{ display: "flex", gap: "4px" }}>
      <div style={{ width: "15px", height: "15px", margin: "auto 0", backgroundColor: "#333", border: "1px solid #000" }} />
      <span>Other pixels (unlabeled non-neighbor candidates)</span>
    </div>
  </div>

<svg viewBox="0 0 120 120" style={{ width: "90%", maxWidth: "300px", height: "auto" }}>
<rect x={0}  y={0}  width={40} height={40} fill="#333" stroke="#000" />
<rect x={40} y={0}  width={40} height={40} fill="#ccc" stroke="#000" />
<rect x={80} y={0}  width={40} height={40} fill="#333" stroke="#000" />
<rect x={0}  y={40} width={40} height={40} fill="#ccc" stroke="#000" />
<rect x={40} y={40} width={40} height={40} fill="#1f77b4" stroke="#000" />
<rect x={80} y={40} width={40} height={40} fill="#ccc" stroke="#000" />
<rect x={0}  y={80} width={40} height={40} fill="#333" stroke="#000" />
<rect x={40} y={80} width={40} height={40} fill="#ccc" stroke="#000" />
<rect x={80} y={80} width={40} height={40} fill="#333" stroke="#000" />
</svg>

</div>

2. While flood-filling, `Region` metadata is collected (`size`, `minX`, `maxX`, `minY`, `maxY`) and labeled according to an index (`labels`).
3. After all components are labeled and regions metadata computed,
   iterate pixels again. For a pixel whose region is considered _small_
   (fails `isBigEnough(minArea,minWidth,minHeight)`),
   check its four immediate neighbors. If any neighbor belongs to a _big_ region,
   copy that neighbor's RGBA into the small pixel (effectively assigning the small pixel to the big region;
   over time, the small region is consumed by _bigger neighboring regions_).

:::note
This merges only small-region pixels which are adjacent to large regions.
The order of iteration means small pixels near large regions are captured first —
the implementation stops at first qualifying neighbour.
:::

## Mathematical Background

### Connected components

The algorithm computes **connected components** on a planar grid using 4-connectivity.
Formally, we can describe the image as a function:

$$
\begin{align*}
I &: \mathbb{Z}^2 \to \mathcal{C} \\
(x, y) &\mapsto I(x, y)
\end{align*}
$$

:::important

- $I$ is the image function.
- $\mathbb{Z}^2$ is the set of all integer pairs $(x, y)$ representing pixel coordinates.
- $\mathcal{C}$ is the set of all possible RGBA values:
  $$
  \mathcal{C} = \{ (R, G, B, A) \mid R,G,B,A \in [0,255] \}
  $$
- $I(x, y) \in \mathcal{C}$ is the color of the pixel at coordinates $(x, y)$.

> In simple terms, each pixel at position $(x, y)$ has a color given by $I(x, y)$.
> :::

Two pixels, $$p=(x,y)$$ and $$q=(x',y')$$, are **4-adjacent** if $$|x-x'| + |y-y'| = 1$$.
A connected component is a maximal set of pixels, $$S$$, such that any two pixels in $$S$$ are connected by a path of 4-adjacent pixels with identical colors.

A flood-fill (BFS / DFS) computes these components exactly.

### Bounding box & geometric heuristics

For each component we compute an axis-aligned bounding box with integer coordinates:

$$
[minX,maxX]\times[minY,maxY]
$$

The bounding-box width and height are:

$$
\begin{align*}
W &= maxX - minX + 1 \\
H &= maxY - minY + 1
\end{align*}
$$

:::tip
See the source code in the [Region struct](https://github.com/Ryan-Millard/Img2Num/blob/main/src/wasm/modules/image/src/mergeSmallRegionsInPlace.cpp)
to understand how this is used.
:::

The area (component size) is simply the number of pixels in the component, $$|S|$$.
The heuristics used to classify _small_ vs _big_ regions rely on thresholds on both area and bounding box dimensions.
This avoids keeping long thin noise (e.g. a long 1-pixel-wide arm) even if its area is above `minArea`.

### Why 4-connectivity, not 8?

4-connectivity treats diagonally touching pixels as disconnected.
This is stricter and avoids connecting components that only meet at a corner.
Depending on the data, 8-connectivity (connect diagonally too) may be preferred — see the [Variants & Improvements page](../variants-and-improvements).

### What does merging mean here?

The code does not merge region graphs with union operations. Instead, it performs a **pixel-wise recoloring** of small-region pixels to the color of an adjacent big region. That has the practical effect of attaching each small pixel to a neighboring large region. This is a cheap and local merge — it won’t always choose the most semantically correct neighbor if multiple are present.
