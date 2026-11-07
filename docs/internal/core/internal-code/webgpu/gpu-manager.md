# Part 2: The GPU Manager

URL: https://img2num.dev/docs/internal/core/internal-code/webgpu/gpu-manager

To prevent the nightmare of passing `wgpu::Device` and `wgpu::Queue` to every function in your codebase, the `GPU` class utilizes the **Singleton Pattern** .

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
`readWGSLFile(shader_id)` returns an owning `std::string` containing the embedded WGSL source. An unknown ID throws `std::invalid_argument` with the function name and supplied ID, including in Release builds with logging disabled. `createPipeline` propagates this exception before creating a shader module or compute pipeline. The C error boundary preserves the diagnostic as `INVALID_ARGUMENT` and exposes it through `img2num_get_last_error_message()` .

note
The `emscripten_sleep(10)` loop is required in WebAssembly builds to yield the main thread back to the browser so the JavaScript promises resolving the WebGPU hardware can actually fire.

:::danger Not Thread-Safe This implementation is a simple singleton that is not thread-safe.

If you require a thread-safe singleton for this job, please first open an issue for it. :::
