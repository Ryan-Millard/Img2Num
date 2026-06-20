---
id: troubleshooting
title: Troubleshooting
sidebar_position: 12
---

# Troubleshooting

Common issues and their solutions.

## WASM Loading Fails in Node.js

**Symptom:** `Error: Could not load WASM module` or similar.

**Cause:** The `.wasm` binary is not found relative to `index.js`.

**Fix:** Ensure `build-wasm/index.wasm` is present alongside `index.js` in the installed package:

```bash
ls node_modules/img2num/build-wasm/
```

If missing, reinstall:

```bash
npm uninstall img2num
npm install img2num
```

## Blurry or Over-Smoothed Output

Increase `sigma_spatial` or decrease it depending on the image. If it's over-smoothed, reduce it.

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
