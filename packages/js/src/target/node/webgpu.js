import { create } from "webgpu";

export async function initWebGPU() {
  const nativeGpu = create(["backend=vulkan"]);

  globalThis.navigator ??= {};
  globalThis.navigator.gpu = nativeGpu;
}
