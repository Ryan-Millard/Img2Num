# Function: findContours()

URL: https://img2num.dev/docs/js/api/functions/findContours

> **findContours** ( `options` ): `Promise` <`SvgResult` >

Defined in: [safeWasmWrappers.js:236](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L236)

## Parameters

### options

`FindContoursOptions`

The input options.

## Returns

`Promise` <`SvgResult` >

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
