# Interface: BlackThresholdOptions

URL: https://img2num.dev/docs/js/api/interfaces/BlackThresholdOptions

Defined in: [safeWasmWrappers.js:42](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L42)

## Properties

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:45](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L45)

The height of the image.

### num_colors

> **num_colors** : `number`

Defined in: [safeWasmWrappers.js:46](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L46)

Per-channel brightness cutoff (0-255): pixels whose red, green and blue values are all below this become black. Retained as `num_colors` for backwards compatibility.

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:43](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L43)

The image pixel data (flat RGBA array).

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:44](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L44)

The width of the image.
