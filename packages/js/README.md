# img2num

Img2Num is a raster vectorization library — it converts PNG/JPEG images to clean, layered SVG paths.

[![npm](https://img.shields.io/npm/v/img2num)](https://www.npmjs.com/package/img2num)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)

## Supported Runtimes

- **Browsers** — via Web Workers
- **Node.js** — supported (`node >= 14`), uses `worker_threads` with WebGPU via Dawn

> **ESM only.** This package uses `"type": "module"` and has no CommonJS entry point.

## Installation

```bash
npm install img2num
```

```bash
pnpm add img2num
```

```bash
yarn add img2num
```

```bash
bun add img2num
```

## Quick Start

### All-in-one (recommended)

```js
import { imageToUint8ClampedArray, imageToSvg } from "img2num";

const { pixels, width, height } = await imageToUint8ClampedArray(file);
const { svg } = await imageToSvg({ pixels, width, height });

console.log(svg); // SVG string
```

### Step-by-step pipeline

```js
import {
  imageToUint8ClampedArray,
  bilateralFilter,
  kmeans,
  findContours,
} from "img2num";

const { pixels, width, height } = await imageToUint8ClampedArray(file);

const filtered = await bilateralFilter({ pixels, width, height });

const { labels } = await kmeans({
  pixels: filtered,
  width,
  height,
  num_colors: 16,
});

const { svg } = await findContours({ pixels: filtered, labels, width, height });
```

> **Note:** `imageToUint8ClampedArray` uses browser APIs (`Image`, `canvas`) and is only available in browser environments. In Node.js, use a library like `sharp` to decode images to a `Uint8ClampedArray` in RGBA format before passing to the WASM functions.

## API Reference

All WASM-backed functions are `async` and return Promises. For full details see the [JavaScript API reference](https://ryan-millard.github.io/Img2Num/info/docs/next/js/).

### `imageToUint8ClampedArray(file)` *(browser only)*

Converts an image `File` object to raw RGBA pixel data.

| Parameter | Type   | Description              |
| :-------- | :----- | :----------------------- |
| `file`    | `File` | A valid image file input |

**Returns:** `Promise<{ pixels: Uint8ClampedArray, width: number, height: number }>`

---

### `gaussianBlur({ pixels, width, height, sigma_pixels? })`

Applies an FFT-based Gaussian blur.

| Parameter      | Type                | Default         |
| :------------- | :------------------ | :-------------- |
| `pixels`       | `Uint8ClampedArray` | required        |
| `width`        | `number`            | required        |
| `height`       | `number`            | required        |
| `sigma_pixels` | `number`            | `width * 0.005` |

**Returns:** `Promise<Uint8ClampedArray>`

---

### `bilateralFilter({ pixels, width, height, sigma_spatial?, sigma_range?, color_space? })`

Applies an edge-preserving bilateral filter.

| Parameter       | Type                | Default                    |
| :-------------- | :------------------ | :------------------------- |
| `pixels`        | `Uint8ClampedArray` | required                   |
| `width`         | `number`            | required                   |
| `height`        | `number`            | required                   |
| `sigma_spatial` | `number`            | `3`                        |
| `sigma_range`   | `number`            | `50`                       |
| `color_space`   | `number`            | `0` (CIE LAB; `1` = sRGB) |

**Returns:** `Promise<Uint8ClampedArray>`

---

### `blackThreshold({ pixels, width, height, num_colors })`

Reduces image to N colors biased toward dark output.

| Parameter    | Type                | Default  |
| :----------- | :------------------ | :------- |
| `pixels`     | `Uint8ClampedArray` | required |
| `width`      | `number`            | required |
| `height`     | `number`            | required |
| `num_colors` | `number`            | required |

**Returns:** `Promise<Uint8ClampedArray>`

---

### `kmeans({ pixels, width, height, num_colors, max_iter?, color_space? })`

Clusters image pixels using K-Means.

| Parameter     | Type                | Default                    |
| :------------ | :------------------ | :------------------------- |
| `pixels`      | `Uint8ClampedArray` | required                   |
| `width`       | `number`            | required                   |
| `height`      | `number`            | required                   |
| `num_colors`  | `number`            | required                   |
| `max_iter`    | `number`            | `100`                      |
| `color_space` | `number`            | `0` (CIE LAB; `1` = sRGB) |

**Returns:** `Promise<{ pixels: Uint8ClampedArray, labels: Int32Array }>`

---

### `findContours({ pixels, labels, width, height, min_area?, min_thickness? })`

Converts a labeled region map to SVG paths.

| Parameter       | Type                | Default  |
| :-------------- | :------------------ | :------- |
| `pixels`        | `Uint8ClampedArray` | required |
| `labels`        | `Int32Array`        | required |
| `width`         | `number`            | required |
| `height`        | `number`            | required |
| `min_area`      | `number`            | `100`    |
| `min_thickness` | `number`            | `10`     |

**Returns:** `Promise<{ svg: string }>`

---

### `imageToSvg({ pixels, width, height, ...options? })`

All-in-one pipeline: bilateral filter → kmeans → findContours.

| Parameter       | Type                | Default                    |
| :-------------- | :------------------ | :------------------------- |
| `pixels`        | `Uint8ClampedArray` | required                   |
| `width`         | `number`            | required                   |
| `height`        | `number`            | required                   |
| `sigma_spatial` | `number`            | `3`                        |
| `sigma_range`   | `number`            | `50`                       |
| `num_colors`    | `number`            | `16`                       |
| `max_iter`      | `number`            | `100`                      |
| `min_area`      | `number`            | `100`                      |
| `min_thickness` | `number`            | `10`                       |
| `color_space`   | `number`            | `0` (CIE LAB; `1` = sRGB) |

**Returns:** `Promise<{ svg: string }>`

---

## Navigating WebAssembly

This package ships a `.wasm` binary and a worker file. The library automatically selects the correct worker implementation for your runtime — browser Web Workers or Node.js `worker_threads`. Some bundlers need extra configuration to handle `.wasm` assets correctly:

- **Vite** — add to `vite.config.js`:
```js
  assetsInclude: ["**/*.wasm"]
```
- **Webpack 5** — enable `asyncWebAssembly: true` in `experiments`.
- **Other bundlers** — if you run into issues, please [open an issue](https://github.com/Ryan-Millard/Img2Num/issues) so we can document the solution and help others facing the same problem.

We actively welcome contributions to this section — if you've configured a bundler not listed here, please open a PR to add it to our [documentation](https://ryan-millard.github.io/Img2Num/info/docs/).

## Examples

See the React example app at [`example-apps/react-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/react-js) for a full browser integration, or the Node.js console example at [`example-apps/console-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-js).

Try the [live demo](https://ryan-millard.github.io/Img2Num/).

## Build & Test

The WASM module is compiled from C++ using Emscripten. See the [contributor setup docs](https://ryan-millard.github.io/Img2Num/info/docs/next/contributing/setup-and-dependencies/) for full toolchain setup.

```bash
# Build the WASM (from repo root, inside Docker)
just build js
```

```bash
# Run tests
npx vitest run
```

## License

[MIT](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) © Ryan Millard

---

[Documentation](https://ryan-millard.github.io/Img2Num/info/docs/) · [Changelog](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/CHANGELOG.md) · [GitHub](https://github.com/Ryan-Millard/Img2Num)