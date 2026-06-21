import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createWorker() {
  // Reference the worker by path relative to this file at runtime,
  // not via import.meta.url which Vite will try to bundle/inline.
  const workerPath = resolve(__dirname, "./wasmWorker.js");

  const worker = new Worker(workerPath);

  return {
    postMessage: (msg) => worker.postMessage(msg),
    onMessage: (fn) => worker.on("message", fn),
    onError: (fn) => worker.on("error", fn),
    terminate: () => worker.terminate(),
  };
}
