# Function: blackThreshold()

URL: https://img2num.dev/docs/js/api/functions/blackThreshold

> **blackThreshold** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: safeWasmWrappers.js:111

## Parameters

### options

The input options.

#### height

`number`

The height of the image.

#### num_colors

`number`

Number of colors to reduce the image to.

#### pixels

`Uint8ClampedArray` < `ArrayBufferLike` >

The image pixel data (flat RGBA array).

#### width

`number`

The width of the image.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The thresholded image pixels.

## Description

Apply a simple sRGB bin-based threshold on the Uint8ClampedArray image. The bins in this function are determined by the `num_colors` parameter.

## Async

blackThreshold

## Throws

If the WASM function fails.

## Example

```ts
const thresholded = await blackThreshold({ pixels, width, height, num_colors: 16 });
```

## See

[Quantization Wiki](https://en.wikipedia.org/wiki/Color_quantization%7CColor)

## Todo

Support different bias levels for black/white thresholds.

## Variation

Black-biased threshold with customizable number of colors

## Since

0.0.0
