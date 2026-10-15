# Interface: GaussianBlurOptions

URL: https://img2num.dev/docs/js/api/interfaces/GaussianBlurOptions

Defined in: [safeWasmWrappers.js:24](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L24)

## Properties

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:27](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L27)

The height of the image.

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:25](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L25)

The image pixel data (flat RGBA array).

### sigma_pixels?

> `optional`**sigma_pixels?** : `number`

Defined in: [safeWasmWrappers.js:28](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L28)

Standard deviation of the Gaussian blur. Defaults to `width * 0.005` .

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:26](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L26)

The width of the image.
