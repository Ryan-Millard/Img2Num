/**
 * @internal
 */

import createImg2NumModule from "@wasm/index.js";

let wasmModule;
let initialized = false;
let readyPromise;

export function getWasmModule() {
  return wasmModule;
}

export async function initWasmModule() {
  if (initialized) return;

  if (!readyPromise) {
    readyPromise = (async () => {
      if (__TARGET__ === "node") {
        const { initWebGPU } = await import("./target/node/webgpu.js");

        try {
          await initWebGPU();
        } catch (err) {
          console.error(
            `[Img2Num wasmClient] WebGPU init error: ${err}`,
          );
        }
      }

      wasmModule = await createImg2NumModule();
    })();
  }

  await readyPromise;
  initialized = true;
}

export function terminateWasmModule() {
  if (__TARGET__ === "node") {
    import("./target/node/webgpu.js")
      .then(({ destroyWebGPU }) => destroyWebGPU());
  }

  wasmModule = undefined;
  initialized = false;
  readyPromise = undefined;
}
