---
id: faq
title: FAQ (Frequently Asked Questions)
sidebar_position: 12
---

Common issues and their solutions.

## WASM Loading Fails in Node.js

### Symptom
`Error: Could not load WASM module` or similar.

### Cause
The `.wasm` binary is not found relative to `index.js`.

### Fix
Ensure `build-wasm/index.wasm` is present alongside `index.js` in the installed package:

```bash
ls node_modules/img2num/build-wasm/
```

If missing, reinstall:

```bash
npm uninstall img2num
npm install img2num
```

## Blurry or Over-Smoothed Output with Bilateral Filter

If the result appears over-smoothed (loss of edge detail), reduce the spatial standard deviation
(`sigma_spatial` / $\sigma_s$).
If the result is too noisy or insufficiently smoothed, increase it.

Note that bilateral filtering depends on both spatial and range parameters:

- `sigma_spatial` ($\sigma_s$) controls geometric smoothing
- `sigma_range` ($\sigma_r$) controls intensity similarity sensitivity

Both parameters may need to be adjusted per image depending on texture and noise levels.

:::tip[Default Values]

The default Img2Num bilateral filter parameters are tuned for general natural images and typically produce
balanced results.

While fixed parameters work well in most cases, adaptive smoothing strategies are commonly used in image
processing literature to account for variation in noise level and edge density across images
([_Marr & Hildreth, 1980_](https://www.researchgate.net/publication/17083076_Theory_of_Edge_Detection);
[_Canny, 1986_](https://www.researchgate.net/publication/224377985_A_Computational_Approach_To_Edge_Detection)).

:::

## Jagged / Noisy SVG Paths

Increase `min_area` to filter out tiny contours, or increase `sigma_spatial` to smooth noise before clustering.

## K-Means Runs Slow in the Browser

K-means can take seconds on large images. Try:

- Lowering `num_colors`
- Lowering `max_iter`
- Using a smaller source image for development

## Memory Errors (OOM)

The WASM heap is fixed at compile time. Very large images may exceed it. Consider:

- Downscaling the input image
- Splitting the image into tiles

## Missing CIE LAB Output

Make sure `color_space = 0` (default). `color_space = 1` uses sRGB which may produce different cluster boundaries.
