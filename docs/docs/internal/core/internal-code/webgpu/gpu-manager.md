---
title: "Part 2: The GPU Manager"
sidebar_label: "Part 2: GPU Manager"
sidebar_position: 2
description: Explanation of the GPU singleton manager used to access the WebGPU device and queue across the codebase.
keywords:
  - WebGPU
  - GPU manager
  - singleton pattern
  - device queue
  - Dawn
---

To prevent the nightmare of passing `wgpu::Device` and `wgpu::Queue` to every function in your codebase, the `GPU` class utilizes the **Singleton Pattern**.

```cpp
static GPU& getClassInstance() {
    static GPU gpuInstance;
    return gpuInstance;
}

```

**Why this matters:** Only one instance of the WebGPU context exists. Any file can include `gpu.h` and call `GPU::getClassInstance().get_device()` to allocate memory or compile shaders.

The `init_gpu()` function handles the asynchronous handshake with the browser or OS:

1. Requests the **Adapter** (Hardware).
2. Requests the **Device** (Logical connection).
3. Extracts the **Queue** (Submission line).

:::note
The `emscripten_sleep(10)` loop is required in WebAssembly builds to yield the main thread back to the browser so the JavaScript
promises resolving the WebGPU hardware can actually fire.
:::

:::danger Not Thread-Safe
This implementation is a simple singleton that is not thread-safe.

If you require a thread-safe singleton for this job, please first open an issue for it.
:::
