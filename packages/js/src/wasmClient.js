/**
 * @packageDocumentation
 * Low-level interface for calling into the WASM (Img2Num) module directly.
 *
 * @internal
 */

import { WASM_TYPES } from "./wasmTypes.js";
import { getWasmModule, initWasmModule, terminateWasmModule } from "./wasmModule.js";
import { ccallAsync } from "./ccall.js";

/**
 * Call a WASM function.
 */
export async function callWasm({ funcName, args = {}, bufferKeys = [], returnType = "void" }) {
  await initWasmModule();

  const wasmModule = getWasmModule();

  const pointers = new Map();
  const argsMap = new Map(Object.entries(args));

  try {
    for (const { key, type } of bufferKeys) {
      const handler = WASM_TYPES[type];

      if (!handler) {
        throw new Error(`Unsupported type: ${type}`);
      }

      const value = argsMap.get(key);
      const ptr = handler.alloc(value);

      pointers.set(key, {
        ptr,
        type,
        length: value?.length,
      });

      argsMap.set(key, ptr);
    }

    const result = await ccallAsync(funcName, argsMap, returnType);

    const output = Object.create(null);

    for (const { key, type } of bufferKeys) {
      const { ptr, length } = pointers.get(key);

      output[key] = WASM_TYPES[type].read(ptr, length);
    }

    let returnValue = result;

    if (returnType !== "void") {
      returnValue = WASM_TYPES[returnType].read(result);
    }

    if (returnType === "string" && result) {
      wasmModule._free(result);
    }

    return {
      output,
      returnValue,
    };
  } catch (error) {
    throw new Error(`[Img2Num wasmClient] Error: ${error?.message ?? error}`, { cause: error });
  } finally {
    for (const { ptr } of pointers.values()) {
      wasmModule._free(ptr);
    }

    if (__TARGET__ === "node") {
      import("./target/node/webgpu.js").then(({ destroyWebGPU }) => destroyWebGPU());
    }
  }
}

export function terminateWasmWorker() {
  terminateWasmModule();
}
