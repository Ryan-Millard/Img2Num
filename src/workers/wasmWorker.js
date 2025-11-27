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

  const pointers = {}; // Array of pointers, declared here to guarantee freeing in finally block
  try {
    // Allocate buffers for any Array payloads
    if (bufferKeys) {
      for (const key of bufferKeys) {
        const arr = args[key]; // Get the buffer from args based on the key
        const size = arr.length;
        const ptr = wasmModule._malloc(size); // Allocate memory the same size as the buffer
        wasmModule.HEAPU8.set(arr, ptr); // Place the buffer in the newly allocated memory
        pointers[key] = { ptr, size };
        args[key] = ptr; // Change to pass a pointer as an arg
      }
    }

    // Dynamic function lookup (Emscripten exports are prefixed with '_')
    const exportName = `_${funcName}`;
    if (typeof wasmModule[exportName] !== 'function') {
      throw new Error(`WASM export not found: ${exportName}`);
    }

    // Call the function with spread args
    const targetFunction = wasmModule[exportName]; // Identify the function to call
    const targetFunctionArgs = funcName && args ? Object.values(args) : []; // Prepare arguments to pass to function
    const result = targetFunction(...targetFunctionArgs); // Call the function

    // Retrieve buffers back
    const outputs = {};
    if (bufferKeys) {
      for (const key of bufferKeys) {
        const { ptr, size } = pointers[key];
        outputs[key] = new Uint8ClampedArray(wasmModule.HEAPU8.subarray(ptr, ptr + size)); // Get data from buffer
      }
    }

    self.postMessage({ id, output: outputs, returnValue: result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  } finally {
    // Always free pointers
    for (const { ptr } of Object.values(pointers)) {
      wasmModule._free(ptr);
    }
  }
};
