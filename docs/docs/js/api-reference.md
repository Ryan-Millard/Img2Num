---
id: js-api-reference
title: JavaScript API Reference
sidebar_position: 1
---

# JavaScript API Reference

All functions are exported from the `img2num` package. They are async because they communicate with a WASM Web Worker.

## `imageToSvg({ pixels, width, height, options })`

One-shot raster → SVG conversion.

| Option | Default | Description |
| :--- | :--- | :--- |
| `sigma_spatial` | `3` | Bilateral spatial sigma |
| `sigma_range` | `50` | Bilateral range sigma |
| `num_colors` | `16` | K-means cluster count |
| `max_iter` | `100` | K-means max iterations |
| `min_area` | `100` | Minimum contour area |
| `color_space` | `0` | `0` = CIE LAB, `1` = sRGB |

**Returns:** `{ svg: string }`

```js
import { imageToSvg } from "img2num";
const { svg } = await imageToSvg({ pixels, width, height });
```

## `bilateralFilter({ pixels, width, height, sigma_spatial, sigma_range, color_space })`

Edge-preserving bilateral smoothing.

**Returns:** `Promise<Uint8ClampedArray>`

## `kmeans({ pixels, width, height, num_colors, max_iter, color_space })`

K-means color clustering.

**Returns:** `{ pixels: Uint8ClampedArray, labels: Int32Array }`

## `findContours({ pixels, labels, width, height, min_area })`

Convert labeled regions to SVG paths.

**Returns:** `{ svg: string }`

## `imageToUint8ClampedArray(file)`

Loads a `File` or `Blob` into a `[pixels: Uint8ClampedArray, width: number, height: number]` tuple.

**Returns:** `{ pixels: Uint8ClampedArray, width: number, height: number }`

## `imageToUint8ClampedArray.fromDataUrl(dataUrl)`

Loads an image from a Data URL.

**Returns:** `{ pixels: Uint8ClampedArray, width: number, height: number }`

## `callWasm({ funcName, args, bufferKeys, returnType })`

Advanced low-level API for calling raw WASM functions.

| Parameter | Description |
| :--- | :--- |
| `funcName` | WASM export name |
| `args` | Named arguments passed as object |
| `bufferKeys` | Array of `{ key, type }` for buffer transfers |
| `returnType` | Expected return type (`void`, `string`, etc.) |

**Returns:** `Promise<{ output: any, returnValue: any }>`

## `initWasmWorker()`

Manually initializes the WASM worker. Automatically called by higher-level wrappers, but useful if you want lazy initialization.
