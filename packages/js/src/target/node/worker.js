import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { initWebGPU } from "./webgpu.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createWorker() {
  await initWebGPU();

  // Reference the worker by path relative to this file at runtime,
  // not via import.meta.url which Vite will try to bundle/inline.
  const workerPath = resolve(__dirname, './wasmWorker.js');
  
  const worker = new Worker(workerPath);

  return {
    postMessage: (msg) => worker.postMessage(msg),
    onMessage: (fn) => worker.on("message", fn),
    terminate: () => worker.terminate(),
  };
}
