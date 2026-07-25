/**
 * @internal
 */

import createImg2NumModule from "@wasm/index.js";

let wasmModule;
let initialized = false;
let readyPromise;

/**
 * @internal
 * @summary Get the initialized WASM module instance.
 *
 * @description
 * Returns the cached Emscripten module instance. This function assumes
 * {@link initWasmModule} has already completed successfully.
 *
 * @function getWasmModule
 * @returns {Object|undefined} The initialized WASM module.
 * @since 0.3.0
 */
export function getWasmModule() {
  return wasmModule;
}

/**
 * `@summary` Initialize the WASM module. Async as of `#433`. Previously `initWasmWorker`.
 * `@function` initWasmModule
 * `@since` 0.0.0
 */
export async function initWasmModule() {
  if (initialized) return;

  if (!readyPromise) {
    readyPromise = (async () => {
      if (__TARGET__ === "node") {
        const { initWebGPU } = await import("./target/node/webgpu.js");

        try {
          await initWebGPU();
        } catch (err) {
          console.error(`[Img2Num wasmClient] WebGPU init error: ${err}`);
        }
      }

      wasmModule = await createImg2NumModule();
    })();
  }

  await readyPromise;
  initialized = true;
}

/**
 * @summary Release resources held by the WebAssembly module.
 *
 * @description
 * This function is optional. In most applications, there is no need to call
 * it explicitly, as resources are released when the process exits. It is
 * provided for applications that need to reclaim resources—such as a WebGPU
 * device—before program termination so they can be used elsewhere.
 *
 * @async
 * @function terminateWasmModule
 * @returns {Promise<void>} A promise that resolves once all resources have
 * been released and the module has been reset to an uninitialized state.
 * @since 0.3.0
 */
export async function terminateWasmModule() {
  if (__TARGET__ === "node") {
    const { destroyWebGPU } = await import("./target/node/webgpu.js");
    await destroyWebGPU();
  }

  wasmModule = undefined;
  initialized = false;
  readyPromise = undefined;
}
