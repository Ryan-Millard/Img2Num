import { create } from "webgpu";

let gpuInitPromise;

export async function initWebGPU() {
  if (globalThis.navigator?.gpu) return globalThis.navigator.gpu;
  if (!gpuInitPromise) {
    gpuInitPromise = Promise.resolve().then(() => {
      const nativeGpu = create(["backend=vulkan"]);
      globalThis.navigator ??= {};
      globalThis.navigator.gpu = nativeGpu;
      return nativeGpu;
    });
  }
  return gpuInitPromise;
}

// Drop-in companion deallocation handler
export async function destroyWebGPU() {
  // 2. Sever the native reference links so Dawn can drop its ref counts
  if (globalThis.navigator?.gpu) {
    delete globalThis.navigator.gpu;
    if (Object.keys(globalThis.navigator).length === 0) {
      delete globalThis.navigator;
    }
  }

  // 3. Reset our internal module-level promise cache
  gpuInitPromise = null;

  // 4. CRITICAL: Yield to the event loop. This gives Dawn's native engine 
  // a small time window to notice the reference count hit 0, dismantle its 
  // background threads, and flush outstanding callbacks BEFORE the process terminates.
  await new Promise((resolve) => setTimeout(resolve, 50));
}