// Preloaded with `node --import ./tests/register.mjs --test`.
// Lets the real wasmClient/wasmModule code run in plain Node by pointing the
// build-time `@wasm/img2num.js` alias at an in-memory fake instead of a real WASM build.
import { register } from "node:module";

globalThis.__TARGET__ = "browser"; // normally injected by vite `define`
register("./resolve-wasm-alias.mjs", import.meta.url);
