# Interface: FindContoursOptions

URL: https://img2num.dev/docs/js/api/interfaces/FindContoursOptions

Defined in: [safeWasmWrappers.js:64](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L64)

## Properties

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:68](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L68)

Image height.

### labels

> **labels** : `Int32Array` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:66](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L66)

Label array from clustering (e.g., K-Means) or segmentation.

### min_area?

> `optional`**min_area?** : `number`

Defined in: [safeWasmWrappers.js:69](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L69)

Minimum area of a region to be considered a contour.

### min_thickness?

> `optional`**min_thickness?** : `number`

Defined in: [safeWasmWrappers.js:70](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L70)

Minimum thickness of a region to be considered a contour.

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:65](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L65)

Original image pixels.

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:67](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L67)

Image width.
