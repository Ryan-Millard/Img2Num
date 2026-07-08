# Function: findContours()

URL: https://img2num.dev/docs/js/api/functions/findContours

> **findContours** ( `options` ): `Promise` <{ `svg` : `string` ; }>

Defined in: safeWasmWrappers.js:195

## Parameters

### options

The input options.

#### height

`number`

Image height.

#### labels

`Int32Array` < `ArrayBufferLike` >

Label array from clustering (e.g., K-Means) or segmentation.

#### min_area?

`number` = `100`

Minimum area of a region to be considered a contour.

#### min_thickness?

`number` = `10`

Minimum thickness of a region to be considered a contour.

#### pixels

`Uint8ClampedArray` < `ArrayBufferLike` >

Original image pixels.

#### width

`number`

Image width.

## Returns

`Promise` <{ `svg` : `string` ; }>

Generated SVG.

## Description

Convert an input image and its labeled regions into an SVG.

## Async

findContours

## Throws

If the WASM function fails or input labels are invalid.

## Example

```ts
const { svg } = await findContours({ pixels, labels, width, height });
```

## Variation

Converts labeled (from a clustering algorithm, e.g. K-Means) image into an SVG.

## Since

0.0.0
