#include "img2num.h"
#include "internal/gpu.h"
#include "internal/bilateral_filter_gpu.h"
#include "internal/cielab.h"

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <climits>
#include <cmath>
#include <cstring>
#include <vector>
#include <iostream>

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

void bilateral_filter_gpu(uint8_t *image, size_t width, size_t height,
                      double sigma_spatial, double sigma_range,
                      uint8_t color_space) {
    
    if (sigma_spatial <= 0.0 || sigma_range <= 0.0 || width <= 0 || height <= 0)
        return;
    if (color_space != COLOR_SPACE_OPTION_CIELAB &&
        color_space != COLOR_SPACE_OPTION_RGB)
        return;

    std::vector<uint8_t> result(width * height * 4, 255);
    std::vector<float> result_lab(width * height * 4, 0.0);
    // std::memcpy(image, result.data(), result.size());

    // 1. Sanity Check: Is WebGPU available in this JS context?
    // should be done in bilateral_filter.cpp
    // ========= CIELAB section start =========
    // Compute full image RGB - CIELAB conversion
    std::vector<float> cie_image;
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        cie_image.resize(width * height * 4);

        for (int y{0}; y < height; y++) {
            for (int x{0}; x < width; x++) {
                int center_idx{(y * static_cast<int>(width) + x) * 4};
                uint8_t r0{image[center_idx]};
                uint8_t g0{image[center_idx + 1]};
                uint8_t b0{image[center_idx + 2]};
                uint8_t a0{image[center_idx + 3]};
                float L0, A0, B0;
                rgb_to_lab<uint8_t, float>(r0, g0, b0, L0, A0, B0);

                cie_image[center_idx] = L0 / 255.f;
                cie_image[center_idx + 1] = A0 / 255.f;
                cie_image[center_idx + 2] = B0 / 255.f;
                cie_image[center_idx + 3] = static_cast<float>(a0) / 255.f;  // unused but keep for indexing purposes
            }
        }
    }
    // ========= CIELAB section end =========

    std::cout << "begin wgpu portion" << std::endl;
    // 1. Create Input Texture
    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = { (uint32_t)width, (uint32_t)height, 1 };
    int bytesPerPixel;
    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            texDesc.format = wgpu::TextureFormat::RGBA8Unorm;
            bytesPerPixel = 4;
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB : {
            texDesc.format = wgpu::TextureFormat::RGBA32Float;
            bytesPerPixel = 16;
            break;
        }
    }
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

    std::cout << "upload texture" << std::endl;
    // Upload data to Input Texture
    wgpu::TexelCopyTextureInfo dst = {};
    dst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout layout = {};
    layout.offset = 0;

    layout.bytesPerRow = width * bytesPerPixel; // Tightly packed for upload
    layout.rowsPerImage = height;
    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            GPU::getClassInstance().get_queue().WriteTexture(&dst, image, bytesPerPixel * width * height, &layout, &texDesc.size);
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB : {
            GPU::getClassInstance().get_queue().WriteTexture(&dst, cie_image.data(), bytesPerPixel * width * height, &layout, &texDesc.size);
            break;
        }
    }
    std::cout << "create output texture" << std::endl;
    // 2. Create Output Texture (Storage)
    wgpu::TextureDescriptor outDesc = texDesc;
    outDesc.usage = wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopySrc;
    wgpu::Texture outputTexture = GPU::getClassInstance().get_device().CreateTexture(&outDesc);

    std::cout << "create buffer" << std::endl;
    // 3. Create Uniform Buffer
    float sr = static_cast<float>(sigma_range);
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        sr /= 255.f;
    }
    FilterParams params = { static_cast<float>(sigma_spatial), sr, 0.0f, 0.0f };
    wgpu::BufferDescriptor bufDesc = {};
    bufDesc.size = sizeof(FilterParams);
    bufDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer paramBuffer = GPU::getClassInstance().get_device().CreateBuffer(&bufDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params, sizeof(FilterParams));

    std::cout << "compile shader" << std::endl;
    // 4. Compile Shader
    wgpu::ShaderSourceWGSL wgslDesc;
    std::string shaderSource;
    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            shaderSource = GPU::getClassInstance().readWGSLFile("/resources/bilateral_filter_rgb.wgsl");
            wgslDesc.code = shaderSource.c_str();
            break;
        };
        case COLOR_SPACE_OPTION_CIELAB: {
            shaderSource = GPU::getClassInstance().readWGSLFile("/resources/bilateral_filter_lab.wgsl");
            wgslDesc.code = shaderSource.c_str();
            break;
        }
    }
    wgpu::ShaderModuleDescriptor shaderDesc = {};
    shaderDesc.nextInChain = &wgslDesc;
    shaderDesc.label = "BilateralFilterShader";
    wgpu::ShaderModule shaderModule = GPU::getClassInstance().get_device().CreateShaderModule(&shaderDesc);

    std::cout << "compute pipeline" << std::endl;
    // 5. Create Compute Pipeline
    wgpu::ComputePipelineDescriptor pipelineDesc = {};
    pipelineDesc.compute.module = shaderModule;
    pipelineDesc.compute.entryPoint = "main";
    wgpu::ComputePipeline pipeline = GPU::getClassInstance().get_device().CreateComputePipeline(&pipelineDesc);

    // 6. Create Bind Group
    // Note: We use GetBindGroupLayout(0) to auto-generate layout from shader
    wgpu::BindGroupDescriptor bindGroupDesc = {};
    bindGroupDesc.layout = pipeline.GetBindGroupLayout(0);
    
    wgpu::BindGroupEntry entries[3];
    
    // Entry 0: Input Texture View
    entries[0].binding = 0;
    entries[0].textureView = inputTexture.CreateView();

    // Entry 1: Output Texture View
    entries[1].binding = 1;
    entries[1].textureView = outputTexture.CreateView();

    // Entry 2: Uniform Buffer
    entries[2].binding = 2;
    entries[2].buffer = paramBuffer;
    entries[2].size = sizeof(FilterParams);

    bindGroupDesc.entryCount = 3;
    bindGroupDesc.entries = entries;
    wgpu::BindGroup bindGroup = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc);

    // 7. Dispatch Compute Pass
    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
    wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
    pass.SetPipeline(pipeline);
    pass.SetBindGroup(0, bindGroup);
    // Workgroups of 16x16
    pass.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16);
    pass.End();

    // 8. Prepare for Readback (Copy Texture -> Buffer)
    // We cannot read textures directly on CPU. We must copy to a MapRead buffer.
    uint32_t alignedBytesPerRow = GPU::getAlignedBytesPerRow(width, (uint32_t)bytesPerPixel);
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


    readBuffer.MapAsync(
        wgpu::MapMode::Read, 
        0, 
        bufferSize,
        wgpu::CallbackMode::AllowProcessEvents,
        [&](wgpu::MapAsyncStatus status, wgpu::StringView message) {
            
            if (status == wgpu::MapAsyncStatus::Success) {
                std::cout << "Map success: " << message.data << std::endl;
                // Get the raw pointer
                const uint8_t* mappedData = (const uint8_t*)readBuffer.GetConstMappedRange(0, bufferSize);
                // copy to cpu buffer
                for (size_t y = 0; y < height; ++y) {
                    const uint8_t* rowPtr = mappedData + (y * alignedBytesPerRow);
                    for (size_t x = 0; x < width; ++x) {
                        const uint8_t* pixelPtr = rowPtr + (x * bytesPerPixel);
                        size_t dstIndex = 4 * (y * width + x); //RGBA

                        switch (color_space) {
                            case COLOR_SPACE_OPTION_RGB: {
                                result[dstIndex] = *pixelPtr;
                                result[dstIndex + 1] = *(pixelPtr + 1);
                                result[dstIndex + 2] = *(pixelPtr + 2);
                                result[dstIndex + 3] = *(pixelPtr + 3);
                                break;
                            }
                            case COLOR_SPACE_OPTION_CIELAB: {
                                const float* floatPtr = (const float*)pixelPtr;
                                result_lab[dstIndex] = *floatPtr;
                                result_lab[dstIndex + 1] = *(floatPtr + 1);
                                result_lab[dstIndex + 2] = *(floatPtr + 2);
                                result_lab[dstIndex + 3] = *(floatPtr + 3);
                                break;
                            }
                        }
                    }
                }
                
                readBuffer.Unmap();
            } else {
                // Handle error
                std::cerr << "Map failed: " << message.data << std::endl;
            }

            // CRITICAL: This modifies the 'waiting' variable in the outer scope
            waiting = false; 
        }
    );
    
    std::cout << "waiting " << waiting << std::endl;
    
    while (waiting) {
        // std::cout << "waiting, " << std::endl; 
        GPU::getClassInstance().get_instance().ProcessEvents();
        emscripten_sleep(100);
    }
    std::cout << "done wgpu" << std::endl;

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int y{0}; y < height; y++) {
            for (int x{0}; x < width; x++) {
                int center_idx{(y * static_cast<int>(width) + x) * 4};
                float L0{result_lab[center_idx] * 255.f};
                float A0{result_lab[center_idx + 1] * 255.f};
                float B0{result_lab[center_idx + 2] * 255.f};
                uint8_t a0{image[center_idx + 3]};
                uint8_t r0, g0, b0;
                lab_to_rgb<float, uint8_t>(L0, A0, B0, r0, g0, b0);

                result[center_idx] = r0;
                result[center_idx + 1] = g0;
                result[center_idx + 2] = b0;
                result[center_idx + 3] = a0;
            }
        }
    }

    std::memcpy(image, result.data(), result.size());
    std::cout << "done memcpy" << std::endl;
}