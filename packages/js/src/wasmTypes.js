/**
 * @internal
 */

import { getWasmModule } from "./wasmModule.js";

export const WASM_TYPES = {
  void: {
    alloc: () => null,
    read: () => undefined,
  },

  Int32Array: {
    alloc: (arr) => {
      const wasmModule = getWasmModule();
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAP32.set(arr, ptr >> 2);
      return ptr;
    },

    read: (ptr, len) => {
      const wasmModule = getWasmModule();
      return new Int32Array(wasmModule.HEAP32.buffer, ptr, len).slice();
    },
  },

  Uint8Array: {
    alloc: (arr) => {
      const wasmModule = getWasmModule();
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },

    read: (ptr, len) => {
      const wasmModule = getWasmModule();
      return wasmModule.HEAPU8.slice(ptr, ptr + len);
    },
  },

  Uint8ClampedArray: {
    alloc: (arr) => {
      const wasmModule = getWasmModule();
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },

    read: (ptr, len) => {
      const wasmModule = getWasmModule();
      return new Uint8ClampedArray(wasmModule.HEAPU8.slice(ptr, ptr + len));
    },
  },

  string: {
    alloc: (str) => {
      const wasmModule = getWasmModule();
      const len = wasmModule.lengthBytesUTF8(str) + 1;
      const ptr = wasmModule._malloc(len);

      wasmModule.stringToUTF8(str, ptr, len);

      return ptr;
    },

    read: (ptr) => {
      const wasmModule = getWasmModule();
      return ptr ? wasmModule.UTF8ToString(ptr) : null;
    },
  },
};
