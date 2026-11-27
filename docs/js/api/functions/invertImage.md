# Function: invertImage()

URL: https://img2num.dev/docs/js/api/functions/invertImage

> **invertImage** ( `options` ): `Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

Defined in: [safeWasmWrappers.js:222](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L222)

## Parameters

### options

`InvertOptions`

The input image and its dimensions.

## Returns

`Promise` < `Uint8ClampedArray` < `ArrayBufferLike` >>

The inverted image pixels.

## Description

Takes an RGBA `Uint8ClampedArray` and replaces each red, green, and blue channel value with `255 - value` . The alpha channel is preserved.

## Async

invertImage

## Throws

If dimensions or pixel buffer are invalid, or if the WASM function fails.

## Example

```ts
const inverted = await invertImage({ pixels, width, height });
```

## Since

0.4.3
