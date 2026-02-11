/*
Notes:
- WASM exposes its linear memory as typed array views like HEAP32 (Int32) or HEAPU8 (byte).
- When adding a new TypedArray type, you must:
  1. Add the new corresponding HEAP view to the EXPORTED_RUNTIME_METHODS flag in the relevant Emscripten module's CMakeLists.txt file.
  2. Allocate memory via _malloc.
  3. Copy data into the appropriate HEAP view.
  4. After the function call, read back via the same HEAP view.
  5. Free the allocated memory.
This ensures JS arrays correctly map to WASM memory.
*/
/*
 *IMPORTANT:
 *The args array to all convenience wrapper functions passed to call()
 *must match the order of the arguments defined in C++ exactly.
 *  e.g.,
 *  ```js
 *  args = [a, b];
 *  ```
 *  ```cpp
 *  int add(int a, int b);
 *  ```
 */

import createImageModule from "@wasm-image";

let wasmModule;
let readyResolve;
const readyPromise = new Promise((res) => (readyResolve = res));

createImageModule().then((mod) => {
  wasmModule = mod;
  readyResolve();
});

// Define a generic type handler
const WASM_TYPES = {
  void: {},
  Int32Array: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAP32.set(arr, ptr / 4);
      return ptr;
    },
    read: (ptr, length) => new Int32Array(wasmModule.HEAP32.buffer, ptr, length).slice(),
  },
  Uint8Array: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },
    read: (ptr, length) => new Uint8Array(wasmModule.HEAPU8.subarray(ptr, ptr + length)).slice(),
  },
  Uint8ClampedArray: {
    alloc: (arr) => {
      const ptr = wasmModule._malloc(arr.byteLength);
      wasmModule.HEAPU8.set(arr, ptr);
      return ptr;
    },
    read: (ptr, length) => new Uint8ClampedArray(wasmModule.HEAPU8.subarray(ptr, ptr + length)).slice(),
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

self.onmessage = async ({ data }) => {
  await readyPromise;

  const { id, funcName, args = undefined, bufferKeys = undefined, returnType = "void" } = data;
  if (bufferKeys?.length && !args) {
    throw new Error(`WASM call "${funcName}" has bufferKeys defined but no args object provided. ` + `Each bufferKey must correspond to a key in args.`);
  }

  const pointers = new Map();
  try {
    const argsMap = new Map(args ? Object.entries(args) : []);

    // Allocate inputs / out params
    bufferKeys?.forEach(({ key, type }) => {
      if (!(type in WASM_TYPES)) throw new Error(`Unsupported type: ${type}`);

      const val = argsMap.get(key);
      const ptr = WASM_TYPES[type].alloc(val);
      pointers.set(key, { ptr, type, length: val?.length });
      argsMap.set(key, ptr);
    });

    // Call the WASM function
    const exportName = `_${funcName}`;
    if (typeof wasmModule[exportName] !== "function") throw new Error(`Export not found: ${exportName}`);

    var result;

    if (funcName === 'bilateral_filter_gpu') {
      // 1. Define the specific signature for your bilateral filter
      // You must map these types carefully.
      // Pointers = 'number', size_t/int = 'number', double/float = 'number'
      const cArgTypes = ["number", "number", "number", "number", "number", "number"];
      
      // 2. Build the argument list explicitly to ensure order
      // Do NOT rely on Object.values(args)
      const cArgs = [
          argsMap.get('pixels'), // args.pixels,       // uint8_t* image
          args.width,        // size_t width
          args.height,       // size_t height
          args.sigma_spatial,// double sigma_spatial
          args.sigma_range,  // double sigma_range
          args.color_space   // uint8_t color_space
      ];

      console.log("Calling C++ with:", cArgs);

      // 3. Use ccall with async: true
      // This wrapper ensures that if C++ sleeps, you get a Promise back.
      result = wasmModule.ccall(
          funcName,          // Name WITHOUT the underscore (e.g. "bilateral_filter_gpu")
          "void",            // Return type
          cArgTypes,         // Argument types
          cArgs,             // Arguments
          { async: true }    // <--- This works here!
      );
    }
    else if (funcName === 'kmeans_gpu') {
      // 1. Define the specific signature for your bilateral filter
      // You must map these types carefully.
      // Pointers = 'number', size_t/int = 'number', double/float = 'number'
      const cArgTypes = ["number", "number", "number", "number", "number", "number", "number", "number"];
      
      // 2. Build the argument list explicitly to ensure order
      // Do NOT rely on Object.values(args)
      const cArgs = [
          argsMap.get('pixels'), // args.pixels,       // uint8_t* image
          argsMap.get('out_pixels'),
          argsMap.get('out_labels'),
          args.width,        // size_t width
          args.height,       // size_t height
          args.num_colors,
          args.max_iter,
          args.color_space   // uint8_t color_space
      ];

      console.log("Calling C++ with:", cArgs);

      // 3. Use ccall with async: true
      // This wrapper ensures that if C++ sleeps, you get a Promise back.
      result = wasmModule.ccall(
          funcName,          // Name WITHOUT the underscore (e.g. "bilateral_filter_gpu")
          "void",            // Return type
          cArgTypes,         // Argument types
          cArgs,             // Arguments
          { async: true }    // <--- This works here!
      );
    }
    else {
      result = wasmModule[exportName](...argsMap.values());
    }

    //Handle the result
    if (result && typeof result.then === 'function') {
      console.log("Asyncify: Pausing JS for C++...");
      result = await result;
      console.log(result);
      console.log("Asyncify: Resumed!");
    }

    // Read back buffers
    const outputMap = new Map();
    bufferKeys?.forEach(({ key, type }) => {
      const p = pointers.get(key);
      outputMap.set(key, WASM_TYPES[type].read(p.ptr, p.length));
    });

    // Handle return value
    console.log("read results")
    console.log(result);
    let returnValue = result;
    if (returnType && WASM_TYPES[returnType] !== WASM_TYPES["void"]) returnValue = WASM_TYPES[returnType].read(result);

    const output = Object.fromEntries(outputMap);
    self.postMessage({ id, output, returnValue });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  } finally {
    // Free memory
    for (const { ptr } of pointers.values()) {
      wasmModule._free(ptr);
    }
  }
};
