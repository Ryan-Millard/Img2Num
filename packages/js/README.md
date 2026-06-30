# img2num

Cross-platform library for converting natural raster images (like PNGs and JPEGs) into clean SVGs - fast, precise and configurable.

[![npm version](https://img.shields.io/npm/v/img2num.svg?style=flat-square)](https://www.npmjs.org/package/img2num)
[![Build status](https://img.shields.io/github/actions/workflow/status/Ryan-Millard/Img2Num/release.yml?branch=main&label=CI&logo=github&style=flat-square)](https://github.com/img2num/img2num/actions/workflows/release.yml)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=img2num&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=img2num)
[![npm downloads](https://img.shields.io/npm/dm/img2num.svg?style=flat-square)](https://npm-stat.com/charts.html?package=img2num)
[![code helpers](https://www.codetriage.com/ryan-millard/img2num/badges/users.svg)](https://www.codetriage.com/Ryan-Millard/img2num)
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

## Browser Usage (CDN)

> IMPORTANT: This is browser-only usage.

### jsDelivr CDN

<!-- IMPORTANT: this is browser-only -->
```html
<script src="https://cdn.jsdelivr.net/npm/img2num@0.2.0/dist/browser/img2num.js"></script>
```
### unpkg CDN

<!-- IMPORTANT: this is browser-only -->
```html
<script src="https://unpkg.com/img2num@0.2.0/dist/browser/img2num.js"></script>
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

All WASM-backed functions are `async` and return Promises. For full details see the [JavaScript API reference](https://ryan-millard.github.io/Img2Num/info/docs/next/js/api/).

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
- **React** color-by-number website: [`example-apps/react-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/react-js)
- **Node.js** console app: [`example-apps/console-js`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/console-js)
Try the [live demo (`React example`)](https://ryan-millard.github.io/Img2Num/).
> **Have a cool idea or want to showcase a new environment?💡**
> We welcome new [example apps](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps).

## License

[MIT](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) © Ryan Millard

---


<div align="center">
[Documentation](https://ryan-millard.github.io/Img2Num/info/docs/) · [Changelog](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/CHANGELOG.md) · [GitHub](https://github.com/Ryan-Millard/Img2Num)
</div>

<br />

[![Contributors](https://contrib.rocks/image?repo=Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)