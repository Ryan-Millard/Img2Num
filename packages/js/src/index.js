/**
 * @packageDocumentation
 * Public entry point for the Img2Num JavaScript package.
 *
 * Re-exports convenience utilities, high-level image-processing
 * functions, and helpers.
 *
 * @module img2num
 * @since 0.0.0
 */

// Convenience
export * from "./imageToUint8ClampedArray.js";

// High-level image operations
export * from "./safeWasmWrappers.js";

// Error type thrown when the core rejects a call (e.g. invalid arguments)
export { Img2NumError } from "./wasmError.js";

// Cleanup of WebAssembly
export { terminateWasmModule } from "./wasmModule.js";
