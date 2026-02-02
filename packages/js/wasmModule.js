// Stable wrapper around the Emscripten-generated module

import createImg2NumModule from "../../build-wasm/build/index.js";

const wasmBinary = await fetch('index.wasm').then(r => r.arrayBuffer());

export default async function() {
  return await createImg2NumModule({
    wasmBinary
  });
};
