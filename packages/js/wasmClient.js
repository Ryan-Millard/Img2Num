// Interface for communicating with wasmWorker

let worker;
let idCounter = 0;
const callbacks = new Map();
let initialized = false;

/**
 * Initialize the WASM worker once.
 * Safe to call multiple times.
 */
export function initWasmWorker() {
  if (initialized) return;

  worker = new Worker(new URL("./wasmWorker.js", import.meta.url), { type: "module" });

  worker.onmessage = ({ data }) => {
    const { id, error, output, returnValue } = data;
    const cb = callbacks.get(id);
    if (!cb) return;

    error ? cb.reject(error) : cb.resolve({ output, returnValue });
    callbacks.delete(id);
  };

  worker.onerror = (event) => {
    const err = new Error(event.message || "WASM worker error");
    for (const [id, cb] of callbacks) {
      cb.reject(err);
    }
    callbacks.clear();
  };

  initialized = true;
}

/**
 * Low-level call into WASM
 */
export function callWasm({ funcName, args = {}, bufferKeys = [], returnType = "void" }) {
  if (!initialized) throw new Error("WASM worker not initialized. Call initWasmWorker() first.");
  const id = idCounter++;
  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });
    worker.postMessage({ id, funcName, args, bufferKeys, returnType }); // <-- send it
  });
}

/**
 * Optional cleanup
 */
export function terminateWasmWorker() {
  if (!worker) return;
  worker.terminate();
  // Reject any pending calls before clearing
  for (const [id, cb] of callbacks) {
    cb.reject(new Error("WASM worker terminated"));
  }
  worker = null;
  callbacks.clear();
  initialized = false;
}
