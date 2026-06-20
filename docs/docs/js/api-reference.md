---
id: js-api-reference
title: JavaScript API Reference
sidebar_position: 1
---

# JavaScript API Reference

The high-level functions below are exported from the `img2num` package. They are
`async` because they run inside a WASM Web Worker. All pixel buffers are flat
**RGBA** `Uint8ClampedArray`s.

## `imageToSvg({ pixels, width, height, ... })`

One-shot raster → SVG conversion (bilateral filter → k-means → contour tracing).

| Option          | Default | Description               |
| :-------------- | :------ | :------------------------ |
| `pixels`        | —       | RGBA `Uint8ClampedArray`  |
| `width`         | —       | Image width               |
| `height`        | —       | Image height              |
| `sigma_spatial` | `3`     | Bilateral spatial sigma   |
| `sigma_range`   | `50`    | Bilateral range sigma     |
| `num_colors`    | `16`    | K-means cluster count     |
| `max_iter`      | `100`   | K-means max iterations    |
| `min_area`      | `100`   | Minimum contour area      |
| `color_space`   | `0`     | `0` = CIE LAB, `1` = sRGB |

**Returns:** `Promise<{ svg: string }>`

```js
import { imageToSvg } from "img2num";
const { svg } = await imageToSvg({ pixels, width, height });
```

## `gaussianBlur({ pixels, width, height, sigma_pixels })`

Gaussian blur accelerated with a 2-D FFT.

| Option         | Default         | Description                                      |
| :------------- | :-------------- | :----------------------------------------------- |
| `sigma_pixels` | `width * 0.005` | Blur standard deviation (5% of width by default) |

**Returns:** `Promise<Uint8ClampedArray>` — the blurred pixels.

## `bilateralFilter({ pixels, width, height, sigma_spatial, sigma_range, color_space })`

Edge-preserving bilateral smoothing.

| Option          | Default | Description               |
| :-------------- | :------ | :------------------------ |
| `sigma_spatial` | `3`     | Bilateral spatial sigma   |
| `sigma_range`   | `50`    | Bilateral range sigma     |
| `color_space`   | `0`     | `0` = CIE LAB, `1` = sRGB |

**Returns:** `Promise<Uint8ClampedArray>` — the filtered pixels.

## `blackThreshold({ pixels, width, height, num_colors })`

Black-biased sRGB bin-based threshold (color quantization toward darker output).

| Option       | Default | Description                             |
| :----------- | :------ | :-------------------------------------- |
| `num_colors` | —       | Number of colors to reduce the image to |

**Returns:** `Promise<Uint8ClampedArray>` — the thresholded pixels.

## `kmeans({ pixels, width, height, num_colors, max_iter, color_space })`

K-means color clustering.

| Option        | Default | Description                          |
| :------------ | :------ | :----------------------------------- |
| `num_colors`  | —       | Number of clusters                   |
| `max_iter`    | `100`   | Maximum iterations                   |
| `color_space` | `0`     | `0` = CIE LAB, `1` = sRGB            |
| `out_pixels`  | _auto_  | Optional pre-allocated output buffer |
| `out_labels`  | _auto_  | Optional pre-allocated labels buffer |

`out_pixels` / `out_labels` are advanced opt-in buffers; omit them and use the
returned values in normal usage.

**Returns:** `Promise<{ pixels: Uint8ClampedArray, labels: Int32Array }>`

## `findContours({ pixels, labels, width, height, min_area })`

Convert labeled regions (e.g. from `kmeans`) to SVG paths.

| Option     | Default | Description                      |
| :--------- | :------ | :------------------------------- |
| `labels`   | —       | `Int32Array` of per-pixel labels |
| `min_area` | `100`   | Minimum region area to keep      |

**Returns:** `Promise<{ svg: string }>`

## `imageToUint8ClampedArray(file)`

Loads a `File` or `Blob` into RGBA pixel data plus dimensions.

**Returns:** `Promise<{ pixels: Uint8ClampedArray, width: number, height: number }>`

## Low-level worker API

These are not re-exported from the package entry point. Import them from the
`img2num/wasmClient.js` subpath only if you need direct control over the worker:

```js
import { initWasmWorker, callWasm, terminateWasmWorker } from "img2num/wasmClient.js";
```

### `initWasmWorker()`

Manually initializes the WASM worker. The high-level wrappers call this for you
on import; use it directly only for explicit/lazy initialization.

### `callWasm({ funcName, args, bufferKeys, returnType })`

Low-level bridge for calling a raw WASM export.

| Parameter    | Default  | Description                                   |
| :----------- | :------- | :-------------------------------------------- |
| `funcName`   | —        | WASM export name                              |
| `args`       | `{}`     | Named arguments passed as an object           |
| `bufferKeys` | `[]`     | Array of `{ key, type }` for buffer transfers |
| `returnType` | `"void"` | Expected return type (`void`, `string`, etc.) |

**Returns:** `Promise<{ output: any, returnValue: any }>`

### `terminateWasmWorker()`

Terminates the worker and releases its resources.
