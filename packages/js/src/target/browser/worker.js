export async function createWorker() {
  const worker = new Worker(new URL("@workers/wasmWorker.js", import.meta.url), { type: "module" });

  return {
    postMessage: (msg) => worker.postMessage(msg),
    onMessage: (fn) => (worker.onmessage = (e) => fn(e.data)),
    terminate: () => worker.terminate(),
  };
}
