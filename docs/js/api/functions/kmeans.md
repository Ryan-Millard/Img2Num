# Function: kmeans()

URL: https://img2num.dev/docs/js/api/functions/kmeans

> **kmeans** ( `options` ): `Promise` <`KMeansResult` >

Defined in: [safeWasmWrappers.js:198](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L198)

## Parameters

### options

`KMeansOptions`

The input options.

## Returns

`Promise` <`KMeansResult` >

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
