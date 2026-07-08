# Function: kmeans()

URL: https://img2num.dev/docs/js/api/functions/kmeans

> **kmeans** ( `options` ): `Promise` <{ `labels` : `Int32Array` ; `pixels` : `Uint8ClampedArray` ; }>

Defined in: safeWasmWrappers.js:151

## Parameters

### options

The input options.

#### color_space?

`number` = `0`

Color space mode.

#### height

`number`

Image height.

#### max_iter?

`number` = `100`

Maximum number of iterations.

#### num_colors

`number`

Number of color clusters.

#### out_labels?

`Int32Array` < `ArrayBufferLike` > = `...`

Output labels array.

#### out_pixels?

`Uint8ClampedArray` < `ArrayBufferLike` > = `...`

Output pixels array.

#### pixels

`Uint8ClampedArray` < `ArrayBufferLike` >

Original image pixels.

#### width

`number`

Image width.

## Returns

`Promise` <{ `labels` : `Int32Array` ; `pixels` : `Uint8ClampedArray` ; }>

Clustered pixels and labels.

## Description

Apply a standard K-Means clustering algorithm to the input image in the specified `color_space` (default is 0: CIE LAB, but 1: sRGB can be use) using pre-specified maximum color and iteration counts. You can provide the `out_pixels` and `out_labels` arrays, however this is atypical in JavaScript (since it is modified in-place and you will need to allocate a sufficiently large array), so it is recommended to use the default arguments and returns.

## Async

kmeans

## Throws

If the WASM function fails or iterations do not converge.

## Example

```ts
const { pixels: clusteredPixels, labels } = await kmeans({ pixels, width, height, num_colors: 8 });
```

## Variation

K-means clustering with default color space

## Since

0.0.0
