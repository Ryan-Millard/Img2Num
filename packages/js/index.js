// Public entry point for the WASM image library

// Worker lifecycle + low-level access
export {
  initWasmWorker as init,
  terminateWasmWorker as terminate,
  callWasm as call,
} from "./wasmClient.js";

// High-level image operations
export * from "./safeWasmWrappers.js";
