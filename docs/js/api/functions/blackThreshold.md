# Function: blackThreshold()

URL: https://img2num.dev/docs/js/api/functions/blackThreshold

> **blackThreshold** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: [safeWasmWrappers.js:169](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L169)

## Parameters

### options

`BlackThresholdOptions`

The input options.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The thresholded image pixels.

## Description

Sets a pixel to pure black when all three of its colour channels are strictly below the `num_colors` cutoff; every other pixel is left untouched. Despite the name (kept for backwards compatibility), `num_colors` is a per-channel 0-255 brightness cutoff, not a number of output colour levels. Values of 0 or less leave the image unchanged. Blackened pixels have their alpha channel set to an opaque 255.

## Async

blackThreshold

## Throws

If the WASM function fails.

## Example

```ts
const thresholded = await blackThreshold({ pixels, width, height, num_colors: 16 });
```

## See

[Wiki](https://en.wikipedia.org/wiki/Thresholding_(image_processing)%7CThresholding)

## Todo

Support different bias levels for black/white thresholds.

## Variation

Black-biased threshold with customizable brightness cutoff

## Since

0.0.0
