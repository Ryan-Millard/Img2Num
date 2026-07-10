/**
 * @packageDocumentation
 * Low-level interface for calling into the WASM (Img2Num) module directly.
 * There is no Worker / worker_threads indirection — calls run on whatever
 * thread imports this module, awaited via Emscripten Asyncify.
 *
 * @file Manages direct calls into the compiled WASM module.
 * @internal
 * @module wasm-client
 * @license MIT
 * @copyright Ryan Millard 2026
 * @author Ryan Millard
 * @since 0.0.0
 */

import createImg2NumModule from "@wasm/index.js";

let wasmModule;
let initialized = false;
let readyPromise;

const WASM_TYPES = {
  void: {
    alloc: () => null,
    read: () => undefined,
  },
  Int32Array: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAP32.set(arr, ptr >> 2);
      return ptr;
    },
    read: (ptr, len) => new Int32Array(wasmModule.HEAP32.buffer, ptr, len).slice(),
  },
  Uint8Array: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },
    read: (ptr, len) => wasmModule.HEAPU8.slice(ptr, ptr + len),
  },
  Uint8ClampedArray: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },
    read: (ptr, len) => new Uint8ClampedArray(wasmModule.HEAPU8.slice(ptr, ptr + len)),
  },
  string: {
    alloc: (str) => {
      const len = wasmModule.lengthBytesUTF8(str) + 1;
      const ptr = wasmModule._malloc(len);
      wasmModule.stringToUTF8(str, ptr, len);
      return ptr;
    },
    read: (ptr) => (ptr ? wasmModule.UTF8ToString(ptr) : null),
  },
};

/**
 * @summary Initialize the WASM module.
 * @function initWasmWorker
 * @since 0.0.0
 */
export async function initWasmWorker() {
  if (initialized) return;
  if (!readyPromise) {
    readyPromise = (async () => {
      if (__TARGET__ === "node") {
        const { initWebGPU } = await import("./target/node/webgpu.js");
        try {
          await initWebGPU();
        } catch (err) {
          console.error(`[Img2Num wasmClient] WebGPU init error: ${err}`);
        }
      }
      // navigator.gpu must exist *before* the module is instantiated,
      // since Emscripten's WebGPU glue binds to it at load time.
      wasmModule = await createImg2NumModule();
    })();
  }
  await readyPromise;
  initialized = true;
}

async function ccallAsync(funcName, argsMap, returnType) {
  const argTypes = Array(argsMap.size).fill("number");
  const retType = returnType !== "void" ? "number" : null;
  return await wasmModule.ccall(funcName, retType, argTypes, [...argsMap.values()], { async: true });
}

/**
 * @summary Call a function in the WASM module.
 * @async
 * @function callWasm
 * @param {Object} __named_parameters
 * @property {string} __named_parameters.funcName
 * @property {Object} [__named_parameters.args={}]
 * @property {string[]} [__named_parameters.bufferKeys=[]]
 * @property {string} [__named_parameters.returnType="void"]
 * @returns {Promise<{output: any, returnValue: any}>}
 * @since 0.0.0
 */
export async function callWasm({ funcName, args = {}, bufferKeys = [], returnType = "void" }) {
  if (!initialized) throw new Error("WASM module not initialized. Call initWasmWorker() first.");

  const pointers = new Map();
  const argsMap = new Map(Object.entries(args));

  try {
    for (const { key, type } of bufferKeys) {
      const handler = WASM_TYPES[type];
      if (!handler) throw new Error(`Unsupported type: ${type}`);

      const val = argsMap.get(key);
      const ptr = handler.alloc(val);

      pointers.set(key, { ptr, type, length: val?.length });
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

    return { output, returnValue };
  } catch (error) {
    throw new Error(`[Img2Num wasmClient] Error: ${error?.message ?? error}`, { cause: error });
  } finally {
  } finally {
    for (const { ptr } of pointers.values()) {
      wasmModule._free(ptr);
    }
    if (__TARGET__ === "node") {
      import("./target/node/webgpu.js").then(({ destroyWebGPU }) => destroyWebGPU());
    }
  }
}

/**
 * @summary Reset internal WASM state.
 * @function terminateWasmWorker
 * @since 0.0.0
 */
export function terminateWasmWorker() {
  if (__TARGET__ === "node") {
    import("./target/node/webgpu.js").then(({ destroyWebGPU }) => destroyWebGPU());
  }
  wasmModule = undefined;
  initialized = false;
  readyPromise = undefined;
}
