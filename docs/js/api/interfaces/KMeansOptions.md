# Interface: KMeansOptions

URL: https://img2num.dev/docs/js/api/interfaces/KMeansOptions

Defined in: [safeWasmWrappers.js:50](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L50)

## Properties

### color_space?

> `optional`**color_space?** :`ColorSpace`

Defined in: [safeWasmWrappers.js:58](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L58)

Color space mode (0: CIE LAB; 1: sRGB).

### height

> **height** : `number`

Defined in: [safeWasmWrappers.js:53](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L53)

Image height.

### max_iter?

> `optional`**max_iter?** : `number`

Defined in: [safeWasmWrappers.js:57](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L57)

Maximum number of iterations.

### num_colors

> **num_colors** : `number`

Defined in: [safeWasmWrappers.js:54](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L54)

Number of color clusters.

### out_labels?

> `optional`**out_labels?** : `Int32Array` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:56](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L56)

Output labels array. Defaults to a new array of `pixels.length / 4` .

### out_pixels?

> `optional`**out_pixels?** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:55](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L55)

Output pixels array. Defaults to a new array the size of `pixels` .

### pixels

> **pixels** : `Uint8ClampedArray` < `ArrayBufferLike` >

Defined in: [safeWasmWrappers.js:51](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L51)

Original image pixels.

### width

> **width** : `number`

Defined in: [safeWasmWrappers.js:52](https://github.com/Ryan-Millard/Img2Num/blob/main/packages/js/src/safeWasmWrappers.js#L52)

Image width.
