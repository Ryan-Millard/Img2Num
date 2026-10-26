## Features

- **Fast raster vectorization** with WASM backend.
- **Typed array support**: Works with `Uint8Array`, `Uint8ClampedArray`, and `Int32Array`.
- **String outputs**: Converts results directly into SVG strings.
- **Runs on the calling thread**: no hidden threads — wrap it in a Web Worker of your own if you want to keep the UI responsive.
- **Zero dependencies**: Pure WASM + JS with no external libraries required.
