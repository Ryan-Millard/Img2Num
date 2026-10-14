// SPDX-FileCopyrightText: 2026 Img2Num Contributors
// SPDX-License-Identifier: MIT

#ifndef IMG2NUM_GPU_UTILS_H
#define IMG2NUM_GPU_UTILS_H

/// @file gpu_utils.h
/// @brief Reusable RAII helpers for WebGPU/Dawn compute work.
///
/// This layer sits on top of the GPU singleton (gpu.h) and eliminates
/// boilerplate that every compute kernel otherwise duplicates:
///   - typed buffer creation, upload, and blocking readback
///   - texture creation, upload, and aligned readback
///   - bind-group construction from a simple list
///   - compute-pass encoding and single-shot dispatch
///
/// All helpers live in the `gpu` namespace and are internal to the library.

#if defined(__EMSCRIPTEN__)
#include <emscripten/emscripten.h>
#endif

#include "internal/gpu.h"
#include "internal/log.h"

#include <cstddef>
#include <cstdint>
#include <cstring>
#include <initializer_list>
#include <mutex>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <vector>
#include <webgpu/webgpu_cpp.h>

namespace gpu {

// =========================================================================
// Color-space constants (shared across kernels)
// =========================================================================

/// @brief Color space selector constants previously duplicated in each kernel.
static constexpr uint8_t COLOR_SPACE_CIELAB {0};
static constexpr uint8_t COLOR_SPACE_RGB {1};

// =========================================================================
// cached_pipeline — pipeline caching wrapper
// =========================================================================

/// @brief Get or create a compute pipeline, caching by shader ID.
///
/// GPU::createPipeline() recreates the shader module and pipeline on every
/// call. This wrapper memoizes the result so that repeated calls with the
/// same shader_id return the cached pipeline instantly.
///
/// @param shader_id  The embedded shader identifier (e.g. "bilateral_filter_rgb").
/// @param label      Debug label for the pipeline.
/// @return Cached wgpu::ComputePipeline.
inline wgpu::ComputePipeline
cached_pipeline(const std::string& shader_id, const std::string& label) {
    // Cache key includes the raw device pointer so that a device recreation
    // (which yields a different WGPUDevice handle) automatically invalidates
    // stale entries.  A mutex guards the map against concurrent access.
    using CacheKey = std::pair<WGPUDevice, std::string>;
    struct PairHash {
        size_t operator()(const CacheKey& k) const {
            auto h1 = std::hash<const void*> {}(static_cast<const void*>(k.first));
            auto h2 = std::hash<std::string> {}(k.second);
            return h1 ^ (h2 << 1);
        }
    };

    static std::mutex mtx;
    static std::unordered_map<CacheKey, wgpu::ComputePipeline, PairHash> cache;

    WGPUDevice raw_device = GPU::getClassInstance().get_device().Get();
    CacheKey key {raw_device, shader_id};

    std::lock_guard<std::mutex> lock(mtx);
    auto it = cache.find(key);
    if (it != cache.end()) {
        return it->second;
    }
    wgpu::ComputePipeline pipeline = GPU::getClassInstance().createPipeline(shader_id, label);
    cache[key] = pipeline;
    return pipeline;
}

// =========================================================================
// map_and_wait — blocking readback primitive
// =========================================================================

/// @brief Block until a MapAsync on @p buffer completes.
///
/// Works on both native Dawn and Emscripten (ASYNCIFY).
/// Returns the pointer from GetConstMappedRange.
///
/// @param buffer  The buffer to map (must have MapRead usage).
/// @param size    Number of bytes to map.
/// @return        Pointer to the mapped data. Valid until buffer.Unmap().
/// @throws std::runtime_error if the mapping fails.
inline const void* map_and_wait(wgpu::Buffer& buffer, size_t size) {
    struct MapState {
        bool done = false;
        bool success = false;
    };

    MapState state;

    buffer.MapAsync(
        wgpu::MapMode::Read, 0, size, wgpu::CallbackMode::AllowProcessEvents,
        [](wgpu::MapAsyncStatus status, wgpu::StringView /*msg*/, void* userdata) {
            auto* s = static_cast<MapState*>(userdata);
            s->done = true;
            s->success = (status == wgpu::MapAsyncStatus::Success);
        },
        static_cast<void*>(&state)
    );

    while (!state.done) {
        GPU::getClassInstance().get_instance().ProcessEvents();
#if defined(__EMSCRIPTEN__)
        emscripten_sleep(10);
#endif
    }

    if (!state.success) {
        throw std::runtime_error("gpu::map_and_wait: MapAsync failed");
    }

    const void* mapped = buffer.GetConstMappedRange(0, size);
    if (!mapped) {
        throw std::runtime_error("gpu::map_and_wait: GetConstMappedRange returned null");
    }
    return mapped;
}

// =========================================================================
// Buffer<T> — RAII typed GPU buffer
// =========================================================================

/// @brief RAII wrapper around a wgpu::Buffer with compile-time type safety.
///
/// T must be a trivially copyable type. The buffer is destroyed when this
/// object goes out of scope.
///
/// @tparam T Element type (e.g. float, uint32_t, FilterParams).
template <typename T> class Buffer {
    static_assert(std::is_trivially_copyable_v<T>, "Buffer<T>: T must be trivially copyable");

  public:
    /// @brief Create a GPU buffer holding @p count elements of T.
    /// @param count   Number of elements.
    /// @param usage   wgpu::BufferUsage flags.
    Buffer(size_t count, wgpu::BufferUsage usage)
        : count_(count)
        , byte_size_(count * sizeof(T)) {
        wgpu::BufferDescriptor desc {};
        desc.size = byte_size_;
        desc.usage = usage;
        buffer_ = GPU::getClassInstance().get_device().CreateBuffer(&desc);
    }

    /// @brief Upload data from CPU to GPU.
    /// @param data   Pointer to source data.
    /// @param count  Number of elements to write.
    /// @param offset_elements  Element offset into the buffer (default 0).
    void write(const T* data, size_t count, size_t offset_elements = 0) {
        GPU::getClassInstance().get_queue().WriteBuffer(
            buffer_, offset_elements * sizeof(T), data, count * sizeof(T)
        );
    }

    /// @brief Upload an entire vector to GPU.
    void write(const std::vector<T>& data) {
        write(data.data(), data.size());
    }

    /// @brief Blocking readback: GPU → CPU.
    ///
    /// Creates an internal staging buffer, copies, maps, waits, and returns
    /// the data. Works on both native Dawn and Emscripten.
    std::vector<T> read() {
        // Create staging buffer
        wgpu::BufferDescriptor staging_desc {};
        staging_desc.size = byte_size_;
        staging_desc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
        wgpu::Buffer staging = GPU::getClassInstance().get_device().CreateBuffer(&staging_desc);

        // Copy GPU buffer → staging
        wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
        encoder.CopyBufferToBuffer(buffer_, 0, staging, 0, byte_size_);
        wgpu::CommandBuffer commands = encoder.Finish();
        GPU::getClassInstance().get_queue().Submit(1, &commands);

        // Map and wait
        const void* mapped = map_and_wait(staging, byte_size_);

        // Copy to vector
        std::vector<T> result(count_);
        std::memcpy(result.data(), mapped, byte_size_);

        staging.Unmap();
        staging.Destroy();
        return result;
    }

    /// @brief Returns the underlying wgpu::Buffer handle.
    const wgpu::Buffer& handle() const {
        return buffer_;
    }

    /// @brief Size in bytes.
    size_t byte_size() const {
        return byte_size_;
    }

    /// @brief Element count.
    size_t size() const {
        return count_;
    }

    // Non-copyable
    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;

    /// @brief Move constructor. Transfers ownership of the GPU buffer.
    Buffer(Buffer&& other) noexcept
        : buffer_(std::move(other.buffer_))
        , count_(other.count_)
        , byte_size_(other.byte_size_) {
        other.buffer_ = nullptr;
        other.count_ = 0;
        other.byte_size_ = 0;
    }

    /// @brief Move assignment. Destroys the current buffer and takes ownership.
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            if (buffer_) {
                buffer_.Destroy();
            }
            buffer_ = std::move(other.buffer_);
            count_ = other.count_;
            byte_size_ = other.byte_size_;
            other.buffer_ = nullptr;
            other.count_ = 0;
            other.byte_size_ = 0;
        }
        return *this;
    }

    /// @brief Destructor. Releases the GPU buffer.
    ~Buffer() {
        if (buffer_) {
            buffer_.Destroy();
        }
    }

  private:
    wgpu::Buffer buffer_ {nullptr};
    size_t count_ {0};
    size_t byte_size_ {0};
};

// =========================================================================
// Texture — RAII texture wrapper
// =========================================================================

/// @brief RAII wrapper around a wgpu::Texture with upload and aligned readback.
///
/// Handles the 256-byte row-alignment requirement for CopyTextureToBuffer
/// automatically during readback.
class Texture {
  public:
    /// @brief Create a 2D texture.
    /// @param width   Width in pixels.
    /// @param height  Height in pixels.
    /// @param format  Texel format (e.g. RGBA8Unorm, RGBA32Float).
    /// @param usage   Texture usage flags.
    Texture(uint32_t width, uint32_t height, wgpu::TextureFormat format, wgpu::TextureUsage usage)
        : width_(width)
        , height_(height)
        , format_(format) {
        wgpu::TextureDescriptor desc {};
        desc.size = {width, height, 1};
        desc.format = format;
        desc.usage = usage;
        texture_ = GPU::getClassInstance().get_device().CreateTexture(&desc);
    }

    /// @brief Upload tightly-packed pixel data to the texture.
    /// @param data       Pointer to pixel data.
    /// @param data_size  Total size in bytes.
    /// @param bytes_per_pixel  Bytes per pixel (e.g. 4 for RGBA8, 16 for RGBA32Float).
    void write(const void* data, size_t data_size, uint32_t bytes_per_pixel) {
        wgpu::TexelCopyTextureInfo dst {};
        dst.texture = texture_;
        wgpu::TexelCopyBufferLayout layout {};
        layout.offset = 0;
        layout.bytesPerRow = width_ * bytes_per_pixel;
        layout.rowsPerImage = height_;
        wgpu::Extent3D extent {width_, height_, 1};
        GPU::getClassInstance().get_queue().WriteTexture(&dst, data, data_size, &layout, &extent);
    }

    /// @brief Blocking readback with automatic 256-byte row-alignment stripping.
    ///
    /// Returns tightly-packed pixel data with no padding between rows.
    ///
    /// @param bytes_per_pixel  Bytes per pixel in the texture format.
    /// @return Tightly-packed pixel data.
    std::vector<uint8_t> read(uint32_t bytes_per_pixel) {
        uint32_t aligned_bpr = GPU::getAlignedBytesPerRow(width_, bytes_per_pixel);
        uint32_t staging_size = aligned_bpr * height_;

        // Create staging buffer
        wgpu::BufferDescriptor staging_desc {};
        staging_desc.size = staging_size;
        staging_desc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
        wgpu::Buffer staging = GPU::getClassInstance().get_device().CreateBuffer(&staging_desc);

        // Encode copy
        wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();

        wgpu::TexelCopyTextureInfo src {};
        src.texture = texture_;
        wgpu::TexelCopyBufferInfo dst {};
        dst.buffer = staging;
        dst.layout.bytesPerRow = aligned_bpr;
        dst.layout.rowsPerImage = height_;
        wgpu::Extent3D extent {width_, height_, 1};
        encoder.CopyTextureToBuffer(&src, &dst, &extent);

        wgpu::CommandBuffer commands = encoder.Finish();
        GPU::getClassInstance().get_queue().Submit(1, &commands);

        // Map and wait
        const auto* mapped = static_cast<const uint8_t*>(map_and_wait(staging, staging_size));

        // Strip row alignment padding
        uint32_t tight_bpr = width_ * bytes_per_pixel;
        std::vector<uint8_t> result(tight_bpr * height_);

        for (uint32_t y = 0; y < height_; ++y) {
            std::memcpy(result.data() + y * tight_bpr, mapped + y * aligned_bpr, tight_bpr);
        }

        staging.Unmap();
        staging.Destroy();
        return result;
    }

    /// @brief Create a default texture view.
    wgpu::TextureView view() const {
        return texture_.CreateView();
    }

    /// @brief Underlying wgpu::Texture handle.
    const wgpu::Texture& handle() const {
        return texture_;
    }

    /// @brief Width of the texture in pixels.
    uint32_t width() const {
        return width_;
    }
    /// @brief Height of the texture in pixels.
    uint32_t height() const {
        return height_;
    }
    /// @brief Texel format of the texture.
    wgpu::TextureFormat format() const {
        return format_;
    }

    // Non-copyable
    Texture(const Texture&) = delete;
    Texture& operator=(const Texture&) = delete;

    /// @brief Move constructor. Transfers ownership of the GPU texture.
    Texture(Texture&& other) noexcept
        : texture_(std::move(other.texture_))
        , width_(other.width_)
        , height_(other.height_)
        , format_(other.format_) {
        other.texture_ = nullptr;
        other.width_ = 0;
        other.height_ = 0;
    }

    /// @brief Move assignment. Destroys the current texture and takes ownership.
    Texture& operator=(Texture&& other) noexcept {
        if (this != &other) {
            if (texture_) {
                texture_.Destroy();
            }
            texture_ = std::move(other.texture_);
            width_ = other.width_;
            height_ = other.height_;
            format_ = other.format_;
            other.texture_ = nullptr;
            other.width_ = 0;
            other.height_ = 0;
        }
        return *this;
    }

    /// @brief Destructor. Releases the GPU texture.
    ~Texture() {
        if (texture_) {
            texture_.Destroy();
        }
    }

  private:
    wgpu::Texture texture_ {nullptr};
    uint32_t width_ {0};
    uint32_t height_ {0};
    wgpu::TextureFormat format_ {};
};

// =========================================================================
// make_bind_group — build from pipeline + resource list
// =========================================================================

/// @brief A single entry for bind-group construction.
struct BindEntry {
    uint32_t binding;
    wgpu::TextureView texture_view {};
    wgpu::Buffer buffer {};
    uint64_t buffer_size {0};
    uint64_t buffer_offset {0};

    /// @brief Create a texture-view entry.
    static BindEntry texture(uint32_t binding, const Texture& tex) {
        BindEntry e;
        e.binding = binding;
        e.texture_view = tex.view();
        return e;
    }

    /// @brief Create a texture-view entry from a raw wgpu::TextureView.
    static BindEntry texture_raw(uint32_t binding, wgpu::TextureView tv) {
        BindEntry e;
        e.binding = binding;
        e.texture_view = std::move(tv);
        return e;
    }

    /// @brief Create a buffer entry (storage or uniform).
    template <typename T> static BindEntry buffer_entry(uint32_t binding, const Buffer<T>& buf) {
        BindEntry e;
        e.binding = binding;
        e.buffer = buf.handle();
        e.buffer_size = buf.byte_size();
        return e;
    }

    /// @brief Create a buffer entry from a raw wgpu::Buffer and size.
    static BindEntry buffer_raw(uint32_t binding, wgpu::Buffer buf, uint64_t size) {
        BindEntry e;
        e.binding = binding;
        e.buffer = std::move(buf);
        e.buffer_size = size;
        return e;
    }
};

/// @brief Build a wgpu::BindGroup from a pipeline layout and a list of entries.
///
/// @param pipeline     The compute pipeline (used to get the bind group layout).
/// @param group_index  Which bind group index (usually 0).
/// @param entries      List of BindEntry objects.
/// @return The constructed wgpu::BindGroup.
inline wgpu::BindGroup make_bind_group(
    const wgpu::ComputePipeline& pipeline, uint32_t group_index,
    const std::vector<BindEntry>& entries
) {
    std::vector<wgpu::BindGroupEntry> wgpu_entries;
    wgpu_entries.reserve(entries.size());

    for (const auto& e : entries) {
        wgpu::BindGroupEntry wge {};
        wge.binding = e.binding;
        if (e.texture_view) {
            wge.textureView = e.texture_view;
        }
        if (e.buffer) {
            wge.buffer = e.buffer;
            wge.size = e.buffer_size;
            wge.offset = e.buffer_offset;
        }
        wgpu_entries.push_back(wge);
    }

    wgpu::BindGroupDescriptor desc {};
    desc.layout = pipeline.GetBindGroupLayout(group_index);
    desc.entryCount = static_cast<uint32_t>(wgpu_entries.size());
    desc.entries = wgpu_entries.data();

    return GPU::getClassInstance().get_device().CreateBindGroup(&desc);
}

// =========================================================================
// dispatch / encode_pass — compute pass helpers
// =========================================================================

/// @brief Encode a compute pass into an existing command encoder.
///
/// Use this for multi-pass work (e.g. bilateral filter with color conversion).
///
/// @param encoder    Existing command encoder to append to.
/// @param pipeline   The compute pipeline to run.
/// @param bind_group The bind group for this pass.
/// @param groups_x   Number of workgroups in X.
/// @param groups_y   Number of workgroups in Y (default 1).
/// @param groups_z   Number of workgroups in Z (default 1).
inline void encode_pass(
    wgpu::CommandEncoder& encoder, const wgpu::ComputePipeline& pipeline,
    const wgpu::BindGroup& bind_group, uint32_t groups_x, uint32_t groups_y = 1,
    uint32_t groups_z = 1
) {
    wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
    pass.SetPipeline(pipeline);
    pass.SetBindGroup(0, bind_group);
    pass.DispatchWorkgroups(groups_x, groups_y, groups_z);
    pass.End();
}

/// @brief Encode, finish, and submit a single compute dispatch.
///
/// Convenience for kernels that only need one pass.
///
/// @param pipeline   The compute pipeline to run.
/// @param bind_group The bind group for this pass.
/// @param groups_x   Number of workgroups in X.
/// @param groups_y   Number of workgroups in Y (default 1).
/// @param groups_z   Number of workgroups in Z (default 1).
inline void dispatch(
    const wgpu::ComputePipeline& pipeline, const wgpu::BindGroup& bind_group, uint32_t groups_x,
    uint32_t groups_y = 1, uint32_t groups_z = 1
) {
    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
    encode_pass(encoder, pipeline, bind_group, groups_x, groups_y, groups_z);
    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);
}

// =========================================================================
// workgroup_count — common ceiling-division helper
// =========================================================================

/// @brief Compute the number of workgroups needed to cover @p total_size
///        with workgroups of @p workgroup_size.
///
/// Equivalent to `(total_size + workgroup_size - 1) / workgroup_size`.
inline uint32_t workgroup_count(uint32_t total_size, uint32_t workgroup_size = 16) {
    return (total_size + workgroup_size - 1) / workgroup_size;
}

} // namespace gpu

#endif // IMG2NUM_GPU_UTILS_H
