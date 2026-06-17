import { Worker } from "node:worker_threads";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createWorker() {
  const worker = new Worker(
    new URL("@workers/wasmWorker.js", import.meta.url),
    { type: "module" }
  );

  return {
    postMessage: (msg) => worker.postMessage(msg),
    onMessage: (fn) => worker.on("message", fn),
    terminate: () => worker.terminate(),
  };
}
