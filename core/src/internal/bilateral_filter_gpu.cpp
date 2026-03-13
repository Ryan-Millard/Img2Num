#include "internal/bilateral_filter_gpu.h"

#include <algorithm>
#include <climits>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <vector>

#include "img2num.h"
#include "internal/cielab.h"
#include "internal/gpu.h"

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB{0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB{1};

// Structure matching the WGSL Uniform (std140 layout)
struct FilterParams {
    float sigmaSpatial;
    float sigmaRange;
    // std140 requires 16-byte alignment for structs/vec4s.
    // Two floats = 8 bytes. We likely need padding if this struct grows,
    // but for a standalone bind group of 2 floats, standard alignment usually suffices.
    // However, it is safer to pad to 16 bytes to be sure.
    float _pad1;
    float _pad2;
};

void bilateral_filter_gpu(uint8_t* image, size_t width, size_t height, double sigma_spatial,
                          double sigma_range, uint8_t color_space) {
    if (sigma_spatial <= 0.0 || sigma_range <= 0.0 || width <= 0 || height <= 0) return;
    if (color_space != COLOR_SPACE_OPTION_CIELAB && color_space != COLOR_SPACE_OPTION_RGB) return;

    std::vector<uint8_t> result(width * height * 4, 255);
    std::vector<float> result_lab(width * height * 4, 0.0);

    // CIELAB conversion will run as shader

    std::cout << "begin wgpu portion" << std::endl;
    // 1. Create Input Texture
    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = {static_cast<uint32_t>(width), static_cast<uint32_t>(height), 1};
    int bytesPerPixel{4};
    texDesc.format = wgpu::TextureFormat::RGBA8Unorm;
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

    std::cout << "upload texture" << std::endl;
    // Upload data to Input Texture
    wgpu::TexelCopyTextureInfo dst = {};
    dst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout layout = {};
    layout.offset = 0;

    layout.bytesPerRow = width * bytesPerPixel;  // Tightly packed for upload
    layout.rowsPerImage = height;
    GPU::getClassInstance().get_queue().WriteTexture(&dst, image, bytesPerPixel * width * height,
                                                     &layout, &texDesc.size);

    std::cout << "create output texture" << std::endl;
    // 2. Create Output Texture (Storage)
    wgpu::TextureDescriptor outDesc = texDesc;
    outDesc.usage = wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopySrc;
    wgpu::Texture outputTexture = GPU::getClassInstance().get_device().CreateTexture(&outDesc);

    // 2a. Intermediate textures for LAB if needed
    wgpu::TextureDescriptor descLab = texDesc;
    descLab.format = wgpu::TextureFormat::RGBA32Float;  // <--- CRITICAL
    descLab.usage = wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::TextureBinding;
    // input lab
    wgpu::Texture texLabRaw = GPU::getClassInstance().get_device().CreateTexture(&descLab);
    // filtered lab
    wgpu::Texture texLabFiltered = GPU::getClassInstance().get_device().CreateTexture(&descLab);

    std::cout << "create buffer" << std::endl;
    // 3. Create Uniform Buffer
    float sr = static_cast<float>(sigma_range);
    /*if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        sr /= 255.f;
    }*/
    FilterParams params = {static_cast<float>(sigma_spatial), sr, 0.0f, 0.0f};
    wgpu::BufferDescriptor bufDesc = {};
    bufDesc.size = sizeof(FilterParams);
    bufDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer paramBuffer = GPU::getClassInstance().get_device().CreateBuffer(&bufDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params, sizeof(FilterParams));

    wgpu::ComputePipeline pipeline;
    wgpu::ComputePipeline pipelineRGB2LAB;
    wgpu::ComputePipeline pipelineLAB2RGB;

    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            pipeline = GPU::getClassInstance().createPipeline("bilateral_filter_rgb",
                                                              "BilateralFilterShader");
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
            // also requires RGB-CIELAB conversion shaders
            pipeline = GPU::getClassInstance().createPipeline("bilateral_filter_lab",
                                                              "BilateralFilterShader");
            pipelineRGB2LAB = GPU::getClassInstance().createPipeline("rgb2cielab", "rgb2lab");
            pipelineLAB2RGB = GPU::getClassInstance().createPipeline("cielab2rgb", "lab2rgb");
            break;
        }
    }

    // 6. Create Bind Group

    // filter bind group
    wgpu::BindGroupDescriptor bindGroupDesc = {};
    bindGroupDesc.layout = pipeline.GetBindGroupLayout(0);
    wgpu::BindGroupEntry entries[3];
    // Entry 0: Input Texture View
    entries[0].binding = 0;
    entries[1].binding = 1;

    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            entries[0].textureView = inputTexture.CreateView();
            // Entry 1: Output Texture View
            entries[1].textureView = outputTexture.CreateView();
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
            entries[0].textureView = texLabRaw.CreateView();
            // Entry 1: Output Texture View
            entries[1].textureView = texLabFiltered.CreateView();
            break;
        }
    }
    // Entry 2: Uniform Buffer
    entries[2].binding = 2;
    entries[2].buffer = paramBuffer;
    entries[2].size = sizeof(FilterParams);
    bindGroupDesc.entryCount = 3;
    bindGroupDesc.entries = entries;
    wgpu::BindGroup bindGroup =
        GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc);

    wgpu::BindGroup bindGroupRGB2LAB;
    wgpu::BindGroup bindGroupLAB2RGB;

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        // rgb2lab bind group
        wgpu::BindGroupEntry bg1Entries[2];
        bg1Entries[0].binding = 0;
        bg1Entries[0].textureView = inputTexture.CreateView();
        bg1Entries[1].binding = 1;
        bg1Entries[1].textureView = texLabRaw.CreateView();
        wgpu::BindGroupDescriptor bg1Desc = {};
        bg1Desc.layout = pipelineRGB2LAB.GetBindGroupLayout(0);
        bg1Desc.entryCount = 2;
        bg1Desc.entries = bg1Entries;
        bindGroupRGB2LAB = GPU::getClassInstance().get_device().CreateBindGroup(&bg1Desc);
        // lab2rgb bind group
        wgpu::BindGroupEntry bg2Entries[2];
        bg2Entries[0].binding = 0;
        bg2Entries[0].textureView = texLabFiltered.CreateView();
        bg2Entries[1].binding = 1;
        bg2Entries[1].textureView = outputTexture.CreateView();
        wgpu::BindGroupDescriptor bg2Desc = {};
        bg2Desc.layout = pipelineLAB2RGB.GetBindGroupLayout(0);
        bg2Desc.entryCount = 2;
        bg2Desc.entries = bg2Entries;
        bindGroupLAB2RGB = GPU::getClassInstance().get_device().CreateBindGroup(&bg2Desc);
    }

    // 7. Dispatch Compute Pass
    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        wgpu::ComputePassEncoder pass1 = encoder.BeginComputePass();
        pass1.SetPipeline(pipelineRGB2LAB);
        pass1.SetBindGroup(0, bindGroupRGB2LAB);
        // Workgroups of 16x16
        pass1.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16);
        pass1.End();
    }

    wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
    pass.SetPipeline(pipeline);
    pass.SetBindGroup(0, bindGroup);
    // Workgroups of 16x16
    pass.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16);
    pass.End();

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        wgpu::ComputePassEncoder pass2 = encoder.BeginComputePass();
        pass2.SetPipeline(pipelineLAB2RGB);
        pass2.SetBindGroup(0, bindGroupLAB2RGB);
        // Workgroups of 16x16
        pass2.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16);
        pass2.End();
    }

    // 8. Prepare for Readback (Copy Texture -> Buffer)
    // We cannot read textures directly on CPU. We must copy to a MapRead buffer.
    uint32_t alignedBytesPerRow =
        GPU::getAlignedBytesPerRow(width, static_cast<uint32_t>(bytesPerPixel));
    uint32_t bufferSize = alignedBytesPerRow * height;

    wgpu::BufferDescriptor readBufDesc = {};
    readBufDesc.size = bufferSize;
    readBufDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer readBuffer = GPU::getClassInstance().get_device().CreateBuffer(&readBufDesc);

    wgpu::TexelCopyTextureInfo srcTex = {};
    srcTex.texture = outputTexture;

    wgpu::TexelCopyBufferInfo dstBuf = {};
    dstBuf.buffer = readBuffer;
    dstBuf.layout.bytesPerRow = alignedBytesPerRow;

    encoder.CopyTextureToBuffer(&srcTex, &dstBuf, &texDesc.size);

    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);
    std::cout << "queue submit" << std::endl;

    bool waiting = true;

    // 9. Map Async (To read data back to C++)
    // In a real app, you likely pass a callback function here.
    struct ReadbackContext {
        wgpu::Buffer buffer;
        uint32_t size;
        uint32_t alignedBytesPerRow;
        int width;
        int height;
    };

    readBuffer.MapAsync(wgpu::MapMode::Read, 0, bufferSize, wgpu::CallbackMode::AllowProcessEvents,
                        [&](wgpu::MapAsyncStatus status, wgpu::StringView message) {
                            if (status == wgpu::MapAsyncStatus::Success) {
                                std::cout << "Map success: " << message.data << std::endl;
                                // Get the raw pointer
                                const uint8_t* mappedData =
                                    (const uint8_t*)readBuffer.GetConstMappedRange(0, bufferSize);
                                // copy to cpu buffer
                                for (size_t y = 0; y < height; ++y) {
                                    const uint8_t* rowPtr = mappedData + (y * alignedBytesPerRow);
                                    for (size_t x = 0; x < width; ++x) {
                                        const uint8_t* pixelPtr = rowPtr + (x * bytesPerPixel);
                                        size_t dstIndex = 4 * (y * width + x);  // RGBA

                                        result[dstIndex] = *pixelPtr;
                                        result[dstIndex + 1] = *(pixelPtr + 1);
                                        result[dstIndex + 2] = *(pixelPtr + 2);
                                        result[dstIndex + 3] = *(pixelPtr + 3);
                                    }
                                }

                                readBuffer.Unmap();
                            } else {
                                // Handle error
                                std::cerr << "Map failed: " << message.data << std::endl;
                            }

                            // CRITICAL: This modifies the 'waiting' variable in the outer scope
                            waiting = false;
                        });

    std::cout << "waiting " << waiting << std::endl;

    while (waiting) {
        // std::cout << "waiting, " << std::endl;
        GPU::getClassInstance().get_instance().ProcessEvents();
#if defined(__EMSCRIPTEN__)
        emscripten_sleep(10);
#endif
    }
    std::cout << "done wgpu" << std::endl;

    std::memcpy(image, result.data(), result.size());
    std::cout << "done memcpy" << std::endl;
}