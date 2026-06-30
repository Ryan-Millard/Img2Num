---
title: Img2Num JavaScript
sidebar_label: JavaScript
sidebar_position: 9
---

import Features from "@site/src/md/\_partials/library-features.md";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

> A high-performance raster-to-vector conversion library that transforms images into **SVGs**.
> It is powered by WebAssembly (WASM) for speed, while providing easy-to-use JavaScript wrappers for integration into web or Node.js projects.

<Features />

## Requirements

### Node.js (server-side)

- **Node ≥ 14** is required for ESM support (`"type": "module"` in package.json).
- Node ≥ 16 is recommended if you want top-level `await` and best WASM performance.

### Browser (client-side)

- A modern browser with **ES module** support (`<script type="module">`) and **WebAssembly** support.
- Most browsers from 2020+ are compatible.
- **Not supported:** Internet Explorer 11 or older browsers.

### Files and Bundlers

- When using bundlers (Webpack, Vite, Rollup), ensure that `.wasm` files (like Img2Num's `build-wasm/index.wasm`) are properly served or imported.
- No external JS dependencies are required - the package is pure JS + WASM.

## Installation

### Using a package manager

<Tabs defaultValue="npm">
  <TabItem value="npm">

    ```bash title="Run this in your terminal"
    npm install img2num
    ```

  </TabItem>
  <TabItem value="pnpm">

    ```bash title="Run this in your terminal"
    pnpm add img2num
    ```

  </TabItem>
  <TabItem value="yarn">

    ```bash title="Run this in your terminal"
    yarn add img2num
    ```

  </TabItem>
  <TabItem value="bun">

    ```bash title="Run this in your terminal"
    bun add img2num
    ```

  </TabItem>
</Tabs>

### Using a CDN (Content Delivery Network)

<Tabs defaultValue="jsDelivr">
  <TabItem value="jsDelivr">

  [![CDN: jsDelivr](https://img.shields.io/badge/CDN-jsDelivr-%23f7df1e?logo=jsdelivr&logoColor=black)](https://www.jsdelivr.com/package/npm/img2num)

  ```html title="Paste this into your HTML file"
  <!-- IMPORTANT: this is browser-only -->
  <script src="https://cdn.jsdelivr.net/npm/img2num@0.2.0/dist/browser/img2num.js"></script>
  ```

  </TabItem>
  <TabItem value="unpkg">

  [![CDN: unpkg](https://img.shields.io/badge/CDN-unpkg-%23cb3837?logo=npm&logoColor=white)](https://unpkg.com/img2num/)

  ```html title="Paste this into your HTML file"
  <!-- IMPORTANT: this is browser-only -->
  <script src="https://unpkg.com/img2num@0.2.0/dist/browser/img2num.js"></script>
  ```

  </TabItem>
</Tabs>

## Usage

Img2Num runs in both the **browser** and **Node.js**. The conversion functions
(e.g., `imageToSvg`, `bilateralFilter`, `kmeans`, `findContours`, and others) are identical
across environments - the only difference is how you obtain the RGBA pixel
buffer they operate on. The package automatically resolves the right WASM build
for your environment via its `exports` map, so the `img2num` import is the same
in both cases.

### Browser

In the browser, use `imageToUint8ClampedArray` to decode a `File` or `Blob`
(e.g. from an `<input type="file">` element) into RGBA pixels.

> This example mirrors that of the [React example app](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/react-js/src/components/WasmImageProcessor.jsx).

```js title="Convert an image to an SVG (browser)"
import {
  imageToUint8ClampedArray,
  bilateralFilter,
  kmeans,
  findContours
} from "img2num";

// Get your image from somewhere, e.g. a File from an <input> element:
const imageFile = /* File object, e.g., input.files[0] */;

// Convert image to a Uint8ClampedArray
const { pixels, width, height } = await imageToUint8ClampedArray(imageFile);

// Reduce noise with a bilateral filter
const filtered = await bilateralFilter({
  pixels,
  width,
  height,
});

// Label the image using K-Means (labels needed for next step)
const { labels } = await kmeans({
  pixels: filtered,
  width,
  height,
  num_colors: 16,
});

// Convert image to SVG
const { svg } = await findContours({
  pixels: filtered,
  labels,
  width,
  height,
});
```

### Node.js

Node has no DOM, so `imageToUint8ClampedArray` (which relies on `<canvas>`) is
**not** available. Instead, decode the image to a raw RGBA buffer with a
library such as [`sharp`](https://sharp.pixelplumbing.com/), then hand the
pixels to `imageToSvg` (or the individual stages). Reading the file with
`fs.readFile` alone is not enough - the bytes must be decoded into raw RGBA.

[![sharp](https://img.shields.io/npm/v/sharp?logo=npm&label=sharp)](https://www.npmjs.com/package/sharp)

> This example mirrors the [Node console example app](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/console-js/index.js).

```js title="Convert an image to an SVG (Node.js)"
import { writeFileSync } from "fs";
import { imageToSvg } from "img2num";
import sharp from "sharp";

const imagePath = process.argv[2];

// Decode the image into a flat RGBA Uint8ClampedArray
const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer);
const { width, height } = info;

// One-shot conversion (bilateral filter → k-means → contour tracing)
const { svg } = await imageToSvg({ pixels, width, height });

writeFileSync("output.svg", svg);
```

## Resources

- [Documentation](/docs/js/docs/)
- [GitHub repository](https://github.com/Ryan-Millard/Img2Num)
- [React demo app](https://ryan-millard.github.io/Img2Num/)

## License

The JavaScript package is licensed under the following:

- [![MIT © Ryan Millard](https://img.shields.io/badge/LICENSE:-MIT-blue.svg?logo=open-source-initiative)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
