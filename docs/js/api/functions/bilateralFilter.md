# Function: bilateralFilter()

URL: https://img2num.dev/docs/js/api/functions/bilateralFilter

> **bilateralFilter** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: safeWasmWrappers.js:82

## Parameters

### options

The input options.

#### color_space?

`number` = `0`

Color space mode (0: CIE LAB; 1: sRGB).

#### height

`number`

The height of the image.

#### pixels

`Uint8ClampedArray` < `ArrayBufferLike` >

The image pixel data (flat RGBA array).

#### sigma_range?

`number` = `50`

Range (color) standard deviation.

#### sigma_spatial?

`number` = `3`

Spatial standard deviation.

#### width

`number`

The width of the image.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The filtered image pixels.

## Description

Takes a Uint8ClampedArray and its dimensions and applies a bilateral filter on the Uint8ClampedArray image. The `sigma_spatial` and `sigma_range` set weights to the respective Gaussian kernels applied to spatial (x, y) and range (color) data - they both have recommended default values applied. The default `color_space` is 0, which is CIE LAB, but sRGB can be chosen by setting `color_space` = 1. CIE LAB is more accurate, but sRGB is slightly faster.

## Async

bilateralFilter

## Throws

If the WASM function fails.

## Example

```ts
const filtered = await bilateralFilter({ pixels, width, height });
```

## Variation

Standard bilateral filter with default parameters

## Since

0.0.0
