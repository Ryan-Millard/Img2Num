# Usage Guide

URL: https://img2num.dev/docs/js/usage

## Basic Usage

Img2Num runs in both the **browser** and **Node.js** . The conversion functions (e.g., `imageToSvg` , `bilateralFilter` , `kmeans` , `findContours` , and others) are identical across environments - the only difference is how you obtain the RGBA pixel buffer they operate on. The package automatically resolves the right WASM build for your environment via its `exports` map, so the `img2num` import is the same in both cases.

Basic usage

```js
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

In order to obtain the image data in the format specified by theimageToSvg API docs

### Browsers

For browsers, we already have a function that makes it easy to read out the image's data and use it.

UseimageToUint8ClampedArray to decode a `File` or `Blob` (e.g. from an `<input type="file">` element) into RGBA pixels.

Additional import

```js
import { imageToUint8ClampedArray } from "img2num";
```

Substitute Step 1 (above) with this

```js
const { pixels, width, height } = await imageToUint8ClampedArray(imageFile);
```

See how we use it
See our [`html-js` example application's code](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/html-js/index.html)

### Node.js

Node has no DOM, soimageToUint8ClampedArray (which relies on `<canvas>` ) is **not** available. Instead, decode the image to a raw RGBA buffer with a library such as [sharp](https://sharp.pixelplumbing.com/) , then hand the pixels toimageToSvg .

[![sharp](https://img.shields.io/npm/v/sharp?logo=npm&label=sharp)](https://www.npmjs.com/package/sharp)

Install sharp

```bash
npm install sharp
```

Import sharp

```js
import sharp from "sharp";
```

Substitute Step 1 (above) with this

```js
// Decode the image into a flat RGBA Uint8ClampedArray using sharp
const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer);
const { width, height } = info;
```

`fs.readFile` is insufficient
Reading the file with `fs.readFile` alone is not enough - the bytes must be decoded into raw RGBA format.

## 2. Raster toSVG

See theimageToSvg API docs for more information on configuring the library.

The example above shows the most basic usage of the function, however you can configure parameters such as k (K-Means) k \text{ (K-Means)} k (K-Means) , σ r a n g e and σ s p a t i a l (bilateral filter) \sigma_{range} \text{ and } \sigma_{spatial} \text{ (bilateral filter)} σ r an g e and σ s p a t ia l (bilateral filter) , and others. You **must** include `pixels` (a `Uint8ClampedArray` ), `width` (an `int` ), and `height` (an `int` ) when callingimageToSvg ; the other parameters have defaults and are thus optional.

## 3. Dynamic Resource cleanup

Not a necessary step
CallingterminateWasmModule is not always necessary because it will be called upon teardown of your application. We provide the function as a way to free up resources before program termination in case the program requires them after using our library and before exiting.

This function accepts no arguments and allows early cleanup of the resources dynamically allocated to the Img2Num library during runtime. Calling this function does not deactivate the library - it will still be usable thereafter - but it does make calling it again later slower as it will have to re-allocate those resources that were freed.

*Img2Num manages its own resources.* Although that is the case, we offer you the ability to determine when they should be freed.
