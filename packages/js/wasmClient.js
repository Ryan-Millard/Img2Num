/**
 * @packageDocumentation
 * Advanced low-level interface for communicating with the WASM worker.
 * Provides granular control over calling WASM functions asynchronously,
 * handling memory transfers, and managing worker lifecycle.
 *
 * @file Manages function call requests to the WASM worker.
 * @internal
 *
 * @module wasm-client
 * @license MIT
 * @copyright Ryan Millard 2026
 * @author Ryan Millard
 * @since 0.0.0
 * @description This module provides low-level image processing functions using WASM.
 *              You must specify exact C++ function signatures and manage the input data carefully.
 *              This allows more granular control.
 */

/**
 * Worker instance that handles communication with the WASM module.
 * @type {Worker | null}
 * @private
 */
let worker;
/**
 * Incremental ID counter for correlating requests and responses.
 * @type {number}
 * @private
 */
let idCounter = 0;
/**
 * Maps request IDs to their corresponding promise callbacks.
 * @type {Map<number, {resolve: Function, reject: Function}>}
 * @private
 */
const callbacks = new Map();
/**
 * Flag to ensure the WASM worker is initialized only once.
 * @type {boolean}
 * @private
 */
let initialized = false;

/**
 * @summary Initialize the WASM worker.
 *
 * @description
 * Sets up message and error handlers. Safe to call multiple times;
 * subsequent calls are no-ops. After initialization, functions can be called
 * via {@link callWasm}.
 *
 * @function initWasmWorker
 *
 * @example
 * import { initWasmWorker } from "./wasmClient.js";
 *
 * initWasmWorker();
 *
 * @since 0.0.0
 */
export function initWasmWorker() {
  if (initialized) return;

  worker = new Worker(new URL("./wasmWorker.js", import.meta.url), { type: "module" });

  worker.onmessage = ({ data }) => {
    const { id, error, output, returnValue } = data;
    const cb = callbacks.get(id);
    if (!cb) return;

    error ? cb.reject(new Error(error)) : cb.resolve({ output, returnValue });
    callbacks.delete(id);
  };

  worker.onerror = (event) => {
    const err = new Error(event.message || "WASM worker error");
    for (const [_id, cb] of callbacks) {
      cb.reject(err);
    }
    callbacks.clear();
  };

  initialized = true;
}

/**
 * @summary Call a function in the WASM worker.
 *
 * @description
 * Directly send a request to the WASM worker to call the specified function,
 * passing specific buffers and and arguments.
 *
 * @async
 * @function callWasm
 * @param {Object} __named_parameters - Options for the WASM call.
 * @property {string} __named_parameters.funcName - The name of the WASM function to invoke.
 * @property {Object} [__named_parameters.args={}] - Named arguments to pass to the WASM function.
 * @property {string[]} [__named_parameters.bufferKeys=[]] - Keys of arguments that should be transferred as ArrayBuffers.
 * @property {string} [__named_parameters.returnType="void"] - Expected return type.
 *
 * @returns {Promise<{output: any, returnValue: any}>} Resolves with the result of the WASM function call.
 *
 * @throws {Error} If the worker has not been initialized.
 *
 * @example
 * import { callWasm, initWasmWorker } from "./wasmClient.js";
 *
 * initWasmWorker();
 *
 * const result = await callWasm({
 *   funcName: "gaussian_blur_fft",
 *   args: { pixels, width, height, sigma_pixels: 5 },
 *   bufferKeys: ["pixels"],
 *   returnType: "Uint8ClampedArray"
 * });
 * console.log(result.output);
 *
 * @since 0.0.0
 */
export async function callWasm({ funcName, args = {}, bufferKeys = [], returnType = "void" }) {
  if (!initialized) throw new Error("WASM worker not initialized. Call initWasmWorker() first.");
  const id = idCounter++;
  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });
    worker.postMessage({ id, funcName, args, bufferKeys, returnType }); // <-- send it
  });
}

/**
 * @summary Terminate the WASM worker.
 *
 * @description
 * Terminate the WASM worker used to call WASM functions.
 * Rejects any pending calls before termination and resets internal state
 * so the worker can be reinitialized later.
 * The worker **must be reinitialized** if it is to be used again.
 *
 * @function terminateWasmWorker
 *
 * @example
 * import { terminateWasmWorker } from "./wasmClient.js";
 *
 * terminateWasmWorker();
 *
 * @since 0.0.0
 */
export function terminateWasmWorker() {
  if (!worker) return;
  worker.terminate();
  // Reject any pending calls before clearing
  for (const [_id, cb] of callbacks) {
    cb.reject(new Error("WASM worker terminated"));
  }
  worker = null;
  callbacks.clear();
  initialized = false;
}
