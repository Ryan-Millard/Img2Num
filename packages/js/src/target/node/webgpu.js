import { create } from "webgpu";

let gpuInitPromise;

/**
 * @internal
 * @summary Initialize a WebGPU implementation in Node.js.
 *
 * @description
 * Creates a singleton WebGPU instance using the native `webgpu` package when
 * one does not already exist on `globalThis.navigator.gpu`. The initialized
 * instance is cached so repeated calls return the same promise.
 *
 * @async
 * @function initWebGPU
 * @returns {Promise<GPU>} The initialized WebGPU implementation.
 * @since 0.2.0
 */
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

/**
 * @internal
 * @summary Release the Node.js WebGPU singleton.
 *
 * @description
 * Removes references to the native WebGPU implementation from the global
 * object and clears the module-level initialization cache. A short delay is
 * introduced to allow the underlying native implementation to finish
 * asynchronous cleanup before process termination.
 *
 * @async
 * @function destroyWebGPU
 * @returns {Promise<void>}
 * @since 0.2.0
 */
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
