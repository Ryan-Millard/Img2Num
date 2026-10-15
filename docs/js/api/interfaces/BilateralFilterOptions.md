# Interface: BilateralFilterOptions

URL: https://img2num.dev/docs/js/api/interfaces/BilateralFilterOptions

Defined in: [safeWasmWrappers.js:32](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L32)

## Properties

### color_space?

> `optional`**color_space?** :`ColorSpace`

Defined in: [safeWasmWrappers.js:38](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L38)

Color space mode (0: CIE LAB; 1: sRGB).

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:35](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L35)

The height of the image.

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:33](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L33)

The image pixel data (flat RGBA array).

### sigma_range?

> `optional`**sigma_range?** : `number`

Defined in: [safeWasmWrappers.js:37](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L37)

Range (color) standard deviation.

### sigma_spatial?

> `optional`**sigma_spatial?** : `number`

Defined in: [safeWasmWrappers.js:36](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L36)

Spatial standard deviation.

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:34](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L34)

The width of the image.
