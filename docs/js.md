# Img2Num JavaScript

URL: https://img2num.dev/docs/js

![npm](https://img.shields.io/npm/v/img2num?logo=npm)

What is Img2Num?
Img2Num is a high-performance raster-to-vector conversion library that transforms images into **SVGs** . It is powered by WebAssembly (WASM) for speed, while providing easy-to-use JavaScript wrappers for integration into web or Node.js projects.

## Features

- **Fast raster vectorization** with WASM backend.
- **Typed array support** : Works with `Uint8Array` , `Uint8ClampedArray` , and `Int32Array` .
- **String outputs** : Converts results directly into SVG strings.
- **Worker-friendly** : Supports offloading heavy computations to Web Workers.
- **Zero dependencies** : Pure WASM + JS with no external libraries required.

## Resources

- [HTML demo app](https://img2num.dev/example-apps/html-js/) (low-code)
- [Node.js console demo app](https://github.com/Ryan-Millard/Img2Num/blob/main/example-apps/console-js/index.js) (low-code)
- [React.js demo app](https://img2num.dev/example-apps/react-js/)

## License

The JavaScript package is licensed under the following:

- [![MIT © Img2Num](https://img.shields.io/badge/LICENSE:-MIT-blue.svg?logo=open-source-initiative)](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)
