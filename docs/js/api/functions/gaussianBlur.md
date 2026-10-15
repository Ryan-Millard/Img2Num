# Function: gaussianBlur()

URL: https://img2num.dev/docs/js/api/functions/gaussianBlur

> **gaussianBlur** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: [safeWasmWrappers.js:108](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L108)

## Parameters

### options

`GaussianBlurOptions`

The input options.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The blurred image pixels.

## Description

Takes a Uint8ClampedArray and its dimensions and applies a Gaussian blur on the Uint8ClampedArray image. The `sigma_pixels` parameter determines the blur radius and has a dynamic default value equal to 5% of the image's width. Useful for denoising images by applying a low-pass filter. Sped up by a 2-D FFT.

## Async

gaussianBlur

## Throws

If the WASM function fails or memory allocation fails.

## Example

```ts
const blurred = await gaussianBlur({ pixels, width, height });
```

## Todo

Fix FFT zero-padding bug around edges of the image.

## Variation

Standard Gaussian blur using FFT

## Since

0.0.0
