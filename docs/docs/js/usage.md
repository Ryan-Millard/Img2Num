---
title: Img2Num JavaScript Usage Guide
sidebar_label: Usage
sidebar_position: 4
---

import { MoveRight } from "lucide-react";

# Usage Guide

## Basic Usage

Img2Num runs in both the **browser** and **Node.js**. The conversion functions
(e.g., `imageToSvg`, `bilateralFilter`, `kmeans`, `findContours`, and others) are identical
across environments - the only difference is how you obtain the RGBA pixel
buffer they operate on. The package automatically resolves the right WASM build
for your environment via its `exports` map, so the `img2num` import is the same
in both cases.

```js title="Basic usage"
import {
  imageToSvg,
  terminateWasmModule
} from "img2num";

// 1. Obtain image data (see below)
const { pixels, width, height } = /* your image */;

try {
  // 2. Create the SVG
  const { svg } = await imageToSvg({ pixels, width, height });
} catch(e) {
  // ...
} finally {
  // 3. Cleanup up dynamic resources (see below)
  await terminateWasmModule();
}
```

## 1. Obtaining the image data

In order to obtain the image data in the format specified by the [imageToSvg API docs](../api/functions/imageToSvg)

### Browsers

For browsers, we already have a function that makes it easy to read out the image's data and use it.

Use [imageToUint8ClampedArray](../api/functions/imageToUint8ClampedArray) to decode a `File` or `Blob`
(e.g. from an `<input type="file">` element) into RGBA pixels.

```js title="Additional import"
import { imageToUint8ClampedArray } from "img2num";
```

```js title="Substitute Step 1 (above) with this"
const { pixels, width, height } = await imageToUint8ClampedArray(imageFile);
```

:::tip[See how we use it]
See our [`html-js` example application's code](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/html-js/index.html)
:::

### Node.js

Node has no DOM, so [imageToUint8ClampedArray](../api/functions/imageToUint8ClampedArray) (which relies on `<canvas>`) is
**not** available. Instead, decode the image to a raw RGBA buffer with a
library such as [sharp](https://sharp.pixelplumbing.com/), then hand the
pixels to [imageToSvg](../api/functions/imageToSvg).

[![sharp](https://img.shields.io/npm/v/sharp?logo=npm&label=sharp)](https://www.npmjs.com/package/sharp)

```bash title="Install sharp"
npm install sharp
```

```js title="Import sharp"
import sharp from "sharp";
```

```js title="Substitute Step 1 (above) with this"
// Decode the image into a flat RGBA Uint8ClampedArray using sharp
const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer);
const { width, height } = info;
```

:::caution[`fs.readFile` is insufficient]

Reading the file with `fs.readFile` alone is not enough - the bytes must be decoded into raw RGBA format.

:::

## 2. Raster <span style={{ display: 'none' }}>to </span><MoveRight /> SVG

See the [imageToSvg API docs](../api/functions/imageToSvg) for more information on configuring the library.

The example above shows the most basic usage of the function, however you can configure parameters such as
$k \text{ (K-Means)}$, $\sigma_{range} \text{ and } \sigma_{spatial} \text{ (bilateral filter)}$, and others.
You **must** include `pixels` (a `Uint8ClampedArray`), `width` (an `int`), and `height` (an `int`) when calling
[imageToSvg](../api/functions/imageToSvg); the other parameters have defaults and are thus optional.

## 3. Dynamic Resource cleanup

:::info[Not a necessary step]

Calling [terminateWasmModule](../api/functions/terminateWasmModule) is not always necessary because it will be called upon teardown of your application.

We provide the function as a way to free up resources before program termination in case the program requires them
after using our library and before exiting.

:::

This function accepts no arguments and allows early cleanup of the resources dynamically allocated to the Img2Num library
during runtime. Calling this function does not deactivate the library - it will still be usable thereafter - but it does
make calling it again later slower as it will have to re-allocate those resources that were freed.

_Img2Num manages its own resources._ Although that is the case, we offer you the ability to determine when they should
be freed.
