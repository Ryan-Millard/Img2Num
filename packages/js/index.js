// Public entry point for the WASM image library

// Convenience
export * from "./imageToUint8ClampedArray.js";

// Worker lifecycle + low-level access
export { initWasmWorker as init, terminateWasmWorker as terminate, callWasm as call } from "./wasmClient.js";

// High-level image operations
export * from "./safeWasmWrappers.js";
