/**
 * @file wasmWorker.js
 * @description
 * Worker for calling WASM functions (Img2Num module) with proper memory handling.
 *
 *  Notes:
 *  - WASM exposes its linear memory via typed array views such as HEAP32 (Int32) or HEAPU8 (byte).
 *  - When adding a new TypedArray type:
 *    1. Add the corresponding HEAP view to EXPORTED_RUNTIME_METHODS in the Emscripten CMakeLists.txt.
 *    2. Allocate memory with `_malloc`.
 *    3. Copy data into the appropriate HEAP view. HEAP views are important because they allow the raw data to be read correctly.
 *    4. After the call, read data back from the same HEAP view.
 *    5. Free the allocated memory. This is important! We are using C-style memory since the code interfaces with the C ABI, so there is no GC.
 *  - This ensures JavaScript arrays correctly map to WASM memory.
 *
 * Important:
 * - The `args` object passed to all convenience wrapper functions must match the order
 *   of the C++ function parameters exactly. For example:
 *     ```js
 *     args = { a: 1, b: 2 };
 *     ```
 *     corresponds to
 *     ```cpp
 *     int add(int a, int b);
 *     ```
 *
 * - Async functions:
 *   WebGPU operations inside WASM can be asynchronous. Use Emscripten Asyncify
 *   (via `ccall` with `{ async: true }`) to properly pause and resume execution.
 *
 * @example
 * self.postMessage({
 *   id: 1,
 *   funcName: "bilateral_filter_gpu",
 *   args: { input: myArray },
 *   bufferKeys: [{ key: "input", type: "Uint8Array" }],
 *   returnType: "void"
 * });
 */

import createImg2NumModule from "./build-wasm/index.js";

let wasmModule;

/**
 * Promise that resolves when WASM module is ready.
 * @type {Promise<void>}
 */
const readyPromise = createImg2NumModule().then((mod) => {
  wasmModule = mod;
});

// --------------------
// WASM Type Handlers
// --------------------
/**
 * Handlers for allocating, reading, and freeing different WASM types.
 * @type {Record<string, {alloc: Function, read: Function}>}
 */
const WASM_TYPES = {
  void: {
    alloc: () => null,
    read: () => undefined,
  },

  Int32Array: {
    /**
     * Allocate an Int32Array in WASM memory.
     * @param {Int32Array} arr
     * @returns {number} Pointer to allocated memory
     */
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAP32.set(arr, ptr >> 2);
      return ptr;
    },

    /**
     * Read an Int32Array from WASM memory.
     * @param {number} ptr
     * @param {number} len
     * @returns {Int32Array}
     */
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
    /**
     * Allocate a string in WASM memory.
     * @param {string} str
     * @returns {number} Pointer to allocated memory
     */
    alloc: (str) => {
      const len = wasmModule.lengthBytesUTF8(str) + 1;
      const ptr = wasmModule._malloc(len);
      wasmModule.stringToUTF8(str, ptr, len);
      return ptr;
    },

    /**
     * Read a string from WASM memory.
     * @param {number} ptr
     * @returns {string|null}
     */
    read: (ptr) => (ptr ? wasmModule.UTF8ToString(ptr) : null),
  },
};

// --------------------
// Internal helper
// --------------------
/**
 * Call a WASM function via ccall, handling asyncify automatically.
 * @param {string} funcName
 * @param {Map<string, number>} argsMap - Map of argument names to WASM pointers or numbers
 * @param {string} returnType - WASM return type (e.g., 'void', 'Int32Array', 'string')
 * @returns {Promise<number>} Result pointer or numeric return value
 */
async function callWasm(funcName, argsMap, returnType) {
  const argTypes = Array(argsMap.size).fill("number");
  const retType = returnType !== "void" ? "number" : null;

  return await wasmModule.ccall(funcName, retType, argTypes, [...argsMap.values()], { async: true });
}

// --------------------
// Worker message handler
// --------------------
/**
 * Handle messages from main thread.
 * Expects `data` to contain:
 *   - id: unique message ID
 *   - funcName: WASM export to call
 *   - args: object of input arguments to WASM export
 *   - bufferKeys: array of {key, type} defining memory buffers for WASM export args - JS doesn't have pointers, so we must do this
 *   - returnType: expected return type of the WASM export
 * @param {MessageEvent} event
 */
self.onmessage = async ({ data }) => {
  await readyPromise;

  const { id, funcName, args, bufferKeys, returnType } = data;

  // These are freed in the finally block
  const pointers = new Map();

  try {
    // -------- Validation --------
    if (!funcName) throw new Error("Missing funcName");
    if (!args) throw new Error("Missing args");
    if (!bufferKeys) throw new Error("Missing bufferKeys");
    if (!returnType) throw new Error("Missing returnType");

    const argsMap = new Map(Object.entries(args));

    // -------- Allocate buffers --------
    for (const { key, type } of bufferKeys) {
      const handler = WASM_TYPES[type];
      if (!handler) throw new Error(`Unsupported type: ${type}`);

      const val = argsMap.get(key);
      const ptr = handler.alloc(val);

      pointers.set(key, { ptr, type, length: val?.length });
      argsMap.set(key, ptr);
    }

    // -------- Call WASM --------
    let result = await callWasm(funcName, argsMap, returnType);

    // -------- Read outputs --------
    /** @type {Record<string, any>} */
    const output = {};
    for (const { key, type } of bufferKeys) {
      const { ptr, length } = pointers.get(key);
      output[key] = WASM_TYPES[type].read(ptr, length);
    }

    // -------- Handle return --------
    let returnValue = result;

    if (returnType !== "void") {
      returnValue = WASM_TYPES[returnType].read(result);
    }

    if (returnType === "string" && result) {
      wasmModule._free(result);
    }

    self.postMessage({ id, output, returnValue });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  } finally {
    // -------- Cleanup --------
    for (const { ptr } of pointers.values()) {
      wasmModule._free(ptr);
    }
  }
};
