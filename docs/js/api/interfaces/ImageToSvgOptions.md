# Interface: ImageToSvgOptions

URL: https://img2num.dev/docs/js/api/interfaces/ImageToSvgOptions

Defined in: [safeWasmWrappers.js:74](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L74)

## Properties

### color_space?

> `optional`**color_space?** :`ColorSpace`

Defined in: [safeWasmWrappers.js:84](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L84)

Color space mode (0: CIE LAB; 1: sRGB).

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:77](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L77)

Image height.

### max_iter?

> `optional`**max_iter?** : `number`

Defined in: [safeWasmWrappers.js:81](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L81)

Maximum number of iterations.

### min_area?

> `optional`**min_area?** : `number`

Defined in: [safeWasmWrappers.js:82](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L82)

Minimum area of a region to be considered a contour.

### min_thickness?

> `optional`**min_thickness?** : `number`

Defined in: [safeWasmWrappers.js:83](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L83)

Minimum thickness of a region to be considered a contour.

### num_colors?

> `optional`**num_colors?** : `number`

Defined in: [safeWasmWrappers.js:80](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L80)

Number of color clusters.

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:75](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L75)

Original image pixels.

### sigma_range?

> `optional`**sigma_range?** : `number`

Defined in: [safeWasmWrappers.js:79](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L79)

Range (color) standard deviation.

### sigma_spatial?

> `optional`**sigma_spatial?** : `number`

Defined in: [safeWasmWrappers.js:78](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L78)

Spatial standard deviation.

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:76](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L76)

Image width.
