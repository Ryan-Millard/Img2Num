/**
 * @internal
 * @packageDocumentation
 * Helpers for surfacing errors recorded by the C++ core to JavaScript.
 *
 * The C API never throws across the WASM boundary. Instead, a failing call
 * records an error code and message that can be read back with the exported
 * `get_last_error()` / `get_last_error_message()` functions
 * (`bindings/js/src/wasm_wrapper.c`). This module reads that state and turns it
 * into a readable JavaScript `Error`.
 *
 * It deliberately does not import the WASM module itself, so it can be unit
 * tested without a WASM build.
 */

/**
 * Names for the `img2num_error_t` values (`img2num/img2num_error_t.h`).
 * Keep this order synchronized with the C enum: the index is the numeric code.
 * @internal
 * @type {readonly string[]}
 */
export const ERROR_CODE_NAMES = Object.freeze(["OK", "BAD_ALLOC", "INVALID_ARGUMENT", "RUNTIME", "UNKNOWN"]);

/**
 * @summary Error raised when the Img2Num core rejects a call or fails.
 *
 * @description
 * `code` is the numeric `img2num_error_t` value and `codeName` its name
 * (for example `"INVALID_ARGUMENT"` for bad input such as a too-small image or
 * `k < 1`). `message` is the human-readable explanation from the core.
 *
 * @class
 */
export class Img2NumError extends Error {
  /**
   * @param {string} message - Human-readable description.
   * @param {number} code - Numeric `img2num_error_t` value.
   */
  constructor(message, code) {
    super(message);
    this.name = "Img2NumError";
    this.code = code;
    this.codeName = ERROR_CODE_NAMES[code] ?? "UNKNOWN";
  }
}

/**
 * @internal
 * @summary Read the core's last error, if any.
 *
 * @param {Object} wasmModule - An initialized Emscripten module exposing `ccall`.
 * @returns {Img2NumError|null} An error describing the failure, or `null` when the last call succeeded.
 */
export function readLastError(wasmModule) {
  const code = wasmModule.ccall("get_last_error", "number", [], []);
  if (!code) return null;

  const message = wasmModule.ccall("get_last_error_message", "string", [], []);
  return new Img2NumError(message || `Img2Num failed with error code ${code}`, code);
}
