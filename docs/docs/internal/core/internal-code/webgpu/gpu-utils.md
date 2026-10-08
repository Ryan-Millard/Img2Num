---
title: "Part 3: GPU Utilities Layer"
sidebar_label: "Part 3: Utilities Layer"
sidebar_position: 3
description: Overview of the gpu_utils.h layer for resource management, pipeline caching, and RAII wrappers.
keywords:
  - WebGPU
  - RAII
  - Resource Management
  - Caching
  - Shaders
---

To simplify working with WebGPU and Dawn in C++, the `core/include/internal/gpu_utils.h` header provides a high-level, RAII-based utilities layer. This layer abstracts away much of the boilerplate associated with buffer lifecycle, texture memory, pipeline compilation, and command submission.

## Pipeline Caching

Compiling a WebGPU shader module and compute pipeline can be an expensive operation. If an algorithm is called repeatedly, compiling the pipeline every time degrades performance. 

The `gpu::cached_pipeline()` function resolves this by caching the `wgpu::ComputePipeline` statically:

```cpp
wgpu::ComputePipeline pipeline = gpu::cached_pipeline("my_shader", shader_source_string);
```

**Thread Safety & Device Validation:**
The cache is guarded by a `std::mutex` to prevent race conditions during concurrent compilation. Furthermore, pipelines are keyed by both the `WGPUDevice` and the `shader_id`. This guarantees that if the underlying WebGPU device is lost or recreated, the cache naturally invalidates stale pipelines.

## RAII Resource Management

WebGPU objects require explicit destruction when using the Dawn C++ wrappers. To prevent memory leaks, `gpu_utils.h` provides RAII wrappers:

### `gpu::Buffer<T>`

A strongly-typed, auto-releasing buffer wrapper.

```cpp
// Create a storage buffer of 1024 floats
gpu::Buffer<float> data_buf(
    1024, 
    wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopySrc
);

// Map it async and read the contents synchronously into a std::vector
std::vector<float> results = data_buf.read_contents();
```

### `gpu::Texture`

Wraps a `wgpu::Texture` and its dimensions.

```cpp
// Create a 2D rgba8unorm texture for storage and readback
gpu::Texture img_tex(
    width, height, 
    wgpu::TextureFormat::RGBA8Unorm,
    wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopySrc
);

// Easily read texture back to CPU (handles row-alignment internally)
std::vector<uint8_t> pixels = img_tex.read_contents();
```

Both `Buffer` and `Texture` handle destroying their underlying resources (`buffer.Destroy()`, `texture.Destroy()`) when they go out of scope. They are non-copyable but explicitly movable to allow returning them from factory functions safely.

## Bind Group Construction

WebGPU requires defining a `wgpu::BindGroupDescriptor` and tracking arrays of `wgpu::BindGroupEntry`. The `gpu::make_bind_group` utility streamlines this with a declarative builder pattern:

```cpp
wgpu::BindGroup bind_group = gpu::make_bind_group(pipeline, 0, {
    gpu::BindEntry::buffer_entry(0, input_buffer),
    gpu::BindEntry::buffer_entry(1, output_buffer),
    gpu::BindEntry::texture(2, image_texture)
});
```

This prevents mismatched array bounds and automatically extracts the correct layouts from the passed `ComputePipeline`.

## Compute Passes

For standard "one-shot" compute kernels, `gpu::dispatch()` encodes the pass, finishes the command buffer, and submits it to the `GPU` singleton's queue instantly.

```cpp
uint32_t gx = gpu::workgroup_count(width, 16);
uint32_t gy = gpu::workgroup_count(height, 16);

gpu::dispatch(pipeline, bind_group, gx, gy, 1);
```

For more complex multi-pass algorithms where you need to append to an existing `wgpu::CommandEncoder` before submission, `gpu::encode_pass()` can be used instead.
