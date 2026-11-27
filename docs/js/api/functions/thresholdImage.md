# Function: thresholdImage()

URL: https://img2num.dev/docs/js/api/functions/thresholdImage

> **thresholdImage** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: [safeWasmWrappers.js:257](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L257)

## Parameters

### options

`ThresholdOptions`

The input image, dimensions, and threshold count.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The thresholded image pixels.

## Description

Quantizes the RGB channels using the requested number of thresholds. When `num_thresholds` is 0 or less, the image is returned unchanged.

## Async

thresholdImage

## Throws

If dimensions or pixel buffer are invalid, or if the WASM function fails.

## Example

```ts
const thresholded = await thresholdImage({ pixels, width, height, num_thresholds: 4 });
```

## Since

0.4.3
