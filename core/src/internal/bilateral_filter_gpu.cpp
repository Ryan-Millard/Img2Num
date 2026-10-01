#include "internal/bilateral_filter_gpu.h"

#include "img2num.h"
#include "internal/cielab.h"
#include "internal/gpu_utils.h"

#include <cstddef>
#include <cstdint>
#include <cstring>
#include <vector>

// Structure matching the WGSL Uniform (std140 layout)
#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
struct FilterParams {
    float sigmaSpatial;
    float sigmaRange;
    // std140 requires 16-byte alignment for structs/vec4s.
    // Two floats = 8 bytes. We likely need padding if this struct grows,
    // but for a standalone bind group of 2 floats, standard alignment usually suffices.
    // However, it is safer to pad to 16 bytes to be sure.
    float _pad1;
    float _pad2;
}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

void bilateral_filter_gpu(
    uint8_t* image, size_t width, size_t height, double sigma_spatial, double sigma_range,
    uint8_t color_space
) {
    if (sigma_spatial <= 0.0 || sigma_range <= 0.0 || width <= 0 || height <= 0)
        return;
    if (color_space != gpu::COLOR_SPACE_CIELAB && color_space != gpu::COLOR_SPACE_RGB)
        return;

    const uint32_t w = static_cast<uint32_t>(width);
    const uint32_t h = static_cast<uint32_t>(height);
    constexpr uint32_t bpp = 4; // RGBA8 = 4 bytes per pixel

    IMG2NUM_LOG_INFO("begin wgpu portion");

    // 1. Create textures (RAII — destroyed automatically on scope exit)
    gpu::Texture inputTexture(
        w, h, wgpu::TextureFormat::RGBA8Unorm,
        wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst
    );

    IMG2NUM_LOG_INFO("upload texture");
    inputTexture.write(image, bpp * width * height, bpp);

    IMG2NUM_LOG_INFO("create output texture");
    gpu::Texture outputTexture(
        w, h, wgpu::TextureFormat::RGBA8Unorm,
        wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopySrc
    );

    // Intermediate textures for CIELAB color-space filtering
    gpu::Texture texLabRaw(
        w, h, wgpu::TextureFormat::RGBA32Float,
        wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::TextureBinding
    );
    gpu::Texture texLabFiltered(
        w, h, wgpu::TextureFormat::RGBA32Float,
        wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::TextureBinding
    );

    IMG2NUM_LOG_INFO("create buffer");
    // 2. Create uniform buffer with filter parameters
    gpu::Buffer<FilterParams> paramBuffer(
        1, wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst
    );
    FilterParams params = {
        static_cast<float>(sigma_spatial), static_cast<float>(sigma_range), 0.0f, 0.0f
    };
    paramBuffer.write(&params, 1);

    // 3. Create pipelines
    wgpu::ComputePipeline pipeline;
    wgpu::ComputePipeline pipelineRGB2LAB;
    wgpu::ComputePipeline pipelineLAB2RGB;

    switch (color_space) {
    case gpu::COLOR_SPACE_RGB:
        pipeline = gpu::cached_pipeline("bilateral_filter_rgb", "BilateralFilterShader");
        break;
    case gpu::COLOR_SPACE_CIELAB:
        pipeline = gpu::cached_pipeline("bilateral_filter_lab", "BilateralFilterShader");
        pipelineRGB2LAB = gpu::cached_pipeline("rgb2cielab", "rgb2lab");
        pipelineLAB2RGB = gpu::cached_pipeline("cielab2rgb", "lab2rgb");
        break;
    }

    // 4. Create bind groups
    wgpu::BindGroup bindGroup;
    wgpu::BindGroup bindGroupRGB2LAB;
    wgpu::BindGroup bindGroupLAB2RGB;

    switch (color_space) {
    case gpu::COLOR_SPACE_RGB:
        bindGroup = gpu::make_bind_group(
            pipeline, 0,
            {
                gpu::BindEntry::texture(0, inputTexture),
                gpu::BindEntry::texture(1, outputTexture),
                gpu::BindEntry::buffer_entry(2, paramBuffer),
            }
        );
        break;
    case gpu::COLOR_SPACE_CIELAB:
        bindGroup = gpu::make_bind_group(
            pipeline, 0,
            {
                gpu::BindEntry::texture(0, texLabRaw),
                gpu::BindEntry::texture(1, texLabFiltered),
                gpu::BindEntry::buffer_entry(2, paramBuffer),
            }
        );
        bindGroupRGB2LAB = gpu::make_bind_group(
            pipelineRGB2LAB, 0,
            {
                gpu::BindEntry::texture(0, inputTexture),
                gpu::BindEntry::texture(1, texLabRaw),
            }
        );
        bindGroupLAB2RGB = gpu::make_bind_group(
            pipelineLAB2RGB, 0,
            {
                gpu::BindEntry::texture(0, texLabFiltered),
                gpu::BindEntry::texture(1, outputTexture),
            }
        );
        break;
    }

    // 5. Dispatch compute passes
    uint32_t wgX = gpu::workgroup_count(w);
    uint32_t wgY = gpu::workgroup_count(h);

    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();

    if (color_space == gpu::COLOR_SPACE_CIELAB) {
        gpu::encode_pass(encoder, pipelineRGB2LAB, bindGroupRGB2LAB, wgX, wgY);
    }

    gpu::encode_pass(encoder, pipeline, bindGroup, wgX, wgY);

    if (color_space == gpu::COLOR_SPACE_CIELAB) {
        gpu::encode_pass(encoder, pipelineLAB2RGB, bindGroupLAB2RGB, wgX, wgY);
    }

    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);
    IMG2NUM_LOG_INFO("queue submit");

    // 6. Readback — handles staging buffer, MapAsync, alignment stripping automatically
    std::vector<uint8_t> result = outputTexture.read(bpp);
    std::memcpy(image, result.data(), result.size());
    IMG2NUM_LOG_INFO("done memcpy");

    // All textures and buffers are destroyed automatically by RAII destructors
#if defined(__EMSCRIPTEN__)
    emscripten_sleep(50);
#endif
}
