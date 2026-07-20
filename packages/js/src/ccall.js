/**
 * @internal
 */

import { getWasmModule } from "./wasmModule.js";

/**
 * @internal
 * @summary Invoke an exported Emscripten function asynchronously.
 *
 * @description
 * Wraps `Module.ccall()` using the currently initialized WASM module.
 * All arguments are passed as numeric values, matching the pointer-based
 * interface used internally by the library.
 *
 * @async
 * @function ccallAsync
 * @param {string} funcName - Exported function name.
 * @param {Map<string, *>} argsMap - Ordered function arguments.
 * @param {string} returnType - Logical return type.
 * @returns {Promise<*>} The raw value returned by the exported function.
 * @since 0.3.0
 */
export async function ccallAsync(funcName, argsMap, returnType) {
  const wasmModule = getWasmModule();

  const argTypes = Array(argsMap.size).fill("number");

  const retType = returnType === "void" ? null : "number";

  return wasmModule.ccall(funcName, retType, argTypes, [...argsMap.values()], { async: true });
}
