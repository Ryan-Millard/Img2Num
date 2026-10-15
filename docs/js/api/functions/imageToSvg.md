# Function: imageToSvg()

URL: https://img2num.dev/docs/js/api/functions/imageToSvg

> **imageToSvg** ( `options` ): `Promise` <`SvgResult` >

Defined in: [safeWasmWrappers.js:265](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L265)

## Parameters

### options

`ImageToSvgOptions`

The input options.

## Returns

`Promise` <`SvgResult` >

Generated SVG.

## Description

Convert an input raster image into an SVG. A unification of `bilateralFilter` , `kmeans` , and `findContours` .

## Async

imageToSvg

## Throws

If the WASM function fails or input labels are invalid.

## Example

```ts
const { svg } = await imageToSvg({ pixels, width, height });
```

## Variation

Convert a raster image (e.g., PNG, JPG) into an SVG.

## Since

0.0.0
