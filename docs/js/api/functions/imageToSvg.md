# Function: imageToSvg()

URL: https://img2num.dev/docs/js/api/functions/imageToSvg

> **imageToSvg** ( `options` ): `Promise` <{ `svg` : `string` ; }>

Defined in: safeWasmWrappers.js:234

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

#### min_area?

`number` = `100`

Minimum area of a region to be considered a contour.

#### min_thickness?

`number` = `10`

Minimum thickness of a region to be considered a contour.

#### num_colors?

`number` = `16`

Number of color clusters.

#### pixels

`Uint8ClampedArray` < `ArrayBufferLike` >

Original image pixels.

#### sigma_range?

`number` = `50`

Range (color) standard deviation.

#### sigma_spatial?

`number` = `3`

Spatial standard deviation.

#### width

`number`

Image width.

## Returns

`Promise` <{ `svg` : `string` ; }>

Generated SVG.

## Description

Convert an input raster image into an SVG. A unification of `bilateralFilter` , `kmeans` , and `findContours` .

## Async

imageToSvg

## Throws

If the WASM function fails or input labels are invalid.

## Example

```ts
const { svg } = await findContours({ pixels, labels, width, height });
```

## Variation

Convert a raster image (e.g., PNG, JPG) into an SVG.

## Since

0.0.0
