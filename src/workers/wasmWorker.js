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
import createImageModule from '@wasm-image';

let wasmModule;
let readyResolve;
const readyPromise = new Promise((res) => (readyResolve = res));

// Initialize the module once
createImageModule().then((mod) => {
  wasmModule = mod;
  readyResolve();
});

self.onmessage = async ({ data }) => {
  // Wait until module is ready
  await readyPromise;

  const { id, funcName, args, bufferKeys } = data;

  const pointers = {}; // Keep track of mallocs for freeing
  try {
    // Allocate buffers for any Array payloads
    if (bufferKeys) {
      for (const key of bufferKeys) {
        const arr = args[key]; // Original JS array
        const sizeInBytes = arr.byteLength; // Correct byte size for any TypedArray

        const ptr = wasmModule._malloc(sizeInBytes); // Allocate memory
        // Copy contents into WASM heap
        if (arr instanceof Int32Array) {
          wasmModule.HEAP32.set(arr, ptr / Int32Array.BYTES_PER_ELEMENT);
        } else if (arr instanceof Uint8ClampedArray || arr instanceof Uint8Array) {
          wasmModule.HEAPU8.set(arr, ptr);
        } else {
          throw new Error(`Unsupported TypedArray type for key: ${key}\nIf you added a new data type to useWasmWorker, please make sure to handle its type in wasmWorker`);
        }

        pointers[key] = { ptr, sizeInBytes, type: arr.constructor }; // store type for reading back
        args[key] = ptr; // pass pointer to WASM
      }
    }

    // Dynamic function lookup (Emscripten exports are prefixed with '_')
    const exportName = `_${funcName}`;
    if (typeof wasmModule[exportName] !== 'function') {
      throw new Error(`WASM export not found: ${exportName}`);
    }

    if (funcName === 'bilateral_filter_gpu') {
      // 1. Define the specific signature for your bilateral filter
      // You must map these types carefully.
      // Pointers = 'number', size_t/int = 'number', double/float = 'number'
      const cArgTypes = ["number", "number", "number", "number", "number", "number"];
      
      // 2. Build the argument list explicitly to ensure order
      // Do NOT rely on Object.values(args)
      const cArgs = [
          args.pixels,       // uint8_t* image
          args.width,        // size_t width
          args.height,       // size_t height
          args.sigma_spatial,// double sigma_spatial
          args.sigma_range,  // double sigma_range
          args.color_space   // uint8_t color_space
      ];

      console.log("Calling C++ with:", cArgs);

      // 3. Use ccall with async: true
      // This wrapper ensures that if C++ sleeps, you get a Promise back.
      const result = wasmModule.ccall(
          funcName,          // Name WITHOUT the underscore (e.g. "bilateral_filter_gpu")
          "void",            // Return type
          cArgTypes,         // Argument types
          cArgs,             // Arguments
          { async: true }    // <--- This works here!
      );

      // 4. Handle the result
      if (result && typeof result.then === 'function') {
          console.log("Asyncify: Pausing JS for C++...");
          await result;
          console.log(result);
          console.log("Asyncify: Resumed!");
      }
    }
    else {
      // Call the function
      let targetFunction = wasmModule[exportName];
      let targetFunctionArgs = funcName && args ? Object.values(args) : [];
      let result = targetFunction(...targetFunctionArgs, { async: true });
      
      console.log(targetFunction);
      console.log(result);
    
      // CRITICAL FIX: Check if it returned a Promise (Asyncify)
      if (result && typeof result.then === 'function') {
          // Wait for the C++ function to wake up, finish the loop, and return for real
          await result;
      }
    }

    // Retrieve buffers back
    const outputs = {};
    if (bufferKeys) {
      for (const key of bufferKeys) {
        console.log(key);
        const { ptr, sizeInBytes, type } = pointers[key];
        if (type === Int32Array) {
          outputs[key] = new Int32Array(
            wasmModule.HEAP32.buffer,
            ptr,
            sizeInBytes / Int32Array.BYTES_PER_ELEMENT
          ).slice(); // slice to detach from WASM memory
        } else if (type === Uint8ClampedArray) {
          outputs[key] = new Uint8ClampedArray(
            wasmModule.HEAPU8.subarray(ptr, ptr + sizeInBytes)
          ).slice();
        } else if (type === Uint8Array) {
          outputs[key] = new Uint8Array(
            wasmModule.HEAPU8.subarray(ptr, ptr + sizeInBytes)
          ).slice();
        } else {
          throw new Error(`Unsupported TypedArray type for output key: ${key}\nIf you added a new data type to useWasmWorker, please make sure to handle its type in wasmWorker`);
        }
      }
    }

    // Post back results
    self.postMessage({ id, output: outputs}); // , returnValue: result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  } finally {
    // Always free allocated memory
    for (const { ptr } of Object.values(pointers)) {
      wasmModule._free(ptr);
    }
  }
};
