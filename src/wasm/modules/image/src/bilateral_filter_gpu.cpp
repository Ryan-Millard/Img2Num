#include "bilateral_filter_gpu.h"
#include "cielab.h"
#include "exported.h"

#include <algorithm>
#include <climits>
#include <cmath>
#include <cstring>
#include <vector>
#include <iostream>

#include <webgpu/webgpu_cpp.h>
#include <emscripten/html5.h>

namespace bilateral_gpu {

static constexpr double SIGMA_RADIUS_FACTOR{3.0}; // 3 standard deviations
static constexpr int MAX_KERNEL_RADIUS{50};
// Max possible squared Euclidean distance in a 3-channel 8-bit image: 255^2 * 3
// = 195075 Means max delta between images (imageA - imageB) in RGB channels
// (255^2 * 3)
static constexpr int MAX_RGB_DIST_SQ{255 * 255 * 3};
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

wgpu::Instance instance;
wgpu::Adapter adapter;
wgpu::Device device;
wgpu::Queue queue;

// Helper to align rows for buffer reading (WebGPU requirement: 256 bytes per row)
uint32_t getAlignedBytesPerRow(uint32_t width) {
    uint32_t bytesPerPixel = 4;
    uint32_t unaligned = width * bytesPerPixel;
    uint32_t align = 256;
    return (unaligned + align - 1) & ~(align - 1);
}

void printShaderError(wgpu::ShaderModule shaderModule) {
    shaderModule.GetCompilationInfo(
        // Callback Mode (New API Requirement)
        wgpu::CallbackMode::AllowProcessEvents, 
        // Callback Lambda
        [](wgpu::CompilationInfoRequestStatus status, const wgpu::CompilationInfo* info) {
            if (status != wgpu::CompilationInfoRequestStatus::Success || !info) return;

            for (uint32_t i = 0; i < info->messageCount; ++i) {
                const auto& msg = info->messages[i];
                std::cerr << "Shader Error [" << (msg.type == wgpu::CompilationMessageType::Error ? "ERR" : "WARN") << "]"
                          << " Line " << msg.lineNum << ":" << msg.linePos << " - " 
                          << msg.message.data // .data for StringView
                          << std::endl;
            }
        }
    );
};

bool gpu_initialized = false;
// Global Init Flags
bool adapter_ready = false;
bool device_ready = false;

void init_gpu() {
    if (gpu_initialized) return;

    wgpu::InstanceDescriptor instanceDesc = {};
    instance = wgpu::CreateInstance(&instanceDesc);

    // ---------------------------------------------------------
    // 1. Get Adapter
    // ---------------------------------------------------------
    std::cout << "Requesting Adapter..." << std::endl;
    adapter_ready = false;

    instance.RequestAdapter(
        nullptr,
        wgpu::CallbackMode::AllowProcessEvents, // <--- ALLOW EVENTS
        [](wgpu::RequestAdapterStatus status, wgpu::Adapter a, wgpu::StringView msg) {
            if (status == wgpu::RequestAdapterStatus::Success) {
                adapter = std::move(a);
                std::cout << "Adapter Acquired" << std::endl;
            } else {
                std::cerr << "Adapter Failed: " << msg.data << std::endl;
            }
            adapter_ready = true; // Unblock the loop
        }
    );

    // WAIT LOOP: Yield to browser so it can actually find the adapter
    while (!adapter_ready) {
        instance.ProcessEvents();
        emscripten_sleep(10); // Sleep 10ms
    }

    if (!adapter) {
        std::cerr << "Fatal: Could not get WebGPU Adapter." << std::endl;
        return;
    }

    // ---------------------------------------------------------
    // 2. Get Device
    // ---------------------------------------------------------
    std::cout << "Requesting Device..." << std::endl;
    device_ready = false;

    wgpu::DeviceDescriptor deviceDesc = {};
    deviceDesc.SetUncapturedErrorCallback(
        [](const wgpu::Device&, wgpu::ErrorType, wgpu::StringView msg) {
             std::cerr << "WEBGPU ERROR: " << msg.data << std::endl;
        });

    adapter.RequestDevice(
        &deviceDesc,
        wgpu::CallbackMode::AllowProcessEvents, // <--- ALLOW EVENTS
        [](wgpu::RequestDeviceStatus status, wgpu::Device d, wgpu::StringView msg) {
            if (status == wgpu::RequestDeviceStatus::Success) {
                device = std::move(d);
                std::cout << "Device Acquired" << std::endl;
            } else {
                 std::cerr << "Device Failed: " << msg.data << std::endl;
            }
            device_ready = true; // Unblock the loop
        }
    );

    // WAIT LOOP
    while (!device_ready) {
        instance.ProcessEvents();
        emscripten_sleep(10);
    }

    if (!device) {
        std::cerr << "Fatal: Could not get WebGPU Device." << std::endl;
        return;
    }

    queue = device.GetQueue();
    gpu_initialized = true;
    std::cout << "GPU Fully Initialized." << std::endl;
}

/*void init_gpu() {
    static const auto kTimedWaitAny = wgpu::InstanceFeatureName::TimedWaitAny;
    wgpu::InstanceDescriptor instanceDesc{.requiredFeatureCount = 1,
                                            .requiredFeatures = &kTimedWaitAny};
    instance = wgpu::CreateInstance(&instanceDesc);

    wgpu::Future f1 = instance.RequestAdapter(
        nullptr, wgpu::CallbackMode::WaitAnyOnly,
        [](wgpu::RequestAdapterStatus status, wgpu::Adapter a,
            wgpu::StringView message) {
            std::cout << "RequestAdapter message: " << message.data << "\n";
            if (status != wgpu::RequestAdapterStatus::Success) {
                std::cout << "RequestAdapter: failed" << "\n";
            // exit(0);
            }
            adapter = std::move(a);
        });
    instance.WaitAny(f1, UINT64_MAX);

    wgpu::DeviceDescriptor desc{};
    desc.SetUncapturedErrorCallback([](const wgpu::Device&,
                                        wgpu::ErrorType errorType,
                                        wgpu::StringView message) {
        std::cout << "Device Descriptor message: " << message.data << "\n";
    });

    wgpu::Future f2 = adapter.RequestDevice(
        &desc, wgpu::CallbackMode::WaitAnyOnly,
        [](wgpu::RequestDeviceStatus status, wgpu::Device d,
            wgpu::StringView message) {
            if (status != wgpu::RequestDeviceStatus::Success) {
                std::cout << "RequestDevice: " << message.data << "\n";
            // exit(0);
            }
            device = std::move(d);
        });
    instance.WaitAny(f2, UINT64_MAX);

    queue = device.GetQueue();
    gpu_initialized = true;
}*/

void bilateral_filter_gpu(uint8_t *image, size_t width, size_t height,
                      double sigma_spatial, double sigma_range,
                      uint8_t color_space) {
    
    if (sigma_spatial <= 0.0 || sigma_range <= 0.0 || width <= 0 || height <= 0)
        return;
    if (color_space != COLOR_SPACE_OPTION_CIELAB &&
        color_space != COLOR_SPACE_OPTION_RGB)
        return;

    std::vector<uint8_t> result(width * height * 4, 255);

    // std::memcpy(image, result.data(), result.size());

    // 1. Sanity Check: Is WebGPU available in this JS context?
    int isWebGPUAvailable = EM_ASM_INT({
        if (navigator.gpu) return 1;
        console.error("WEBGPU MISSING: navigator.gpu is undefined. Check HTTPS/Secure Context.");
        return 0;
    });

    if (!isWebGPUAvailable) {
        std::cerr << "ABORTING: WebGPU not supported in this browser context." << std::endl;
        return;
    }

    if (~gpu_initialized) {
        std::cout << "init gpu " << std::endl;
        init_gpu();
    }

    std::cout << "begin wgpu portion" << std::endl;
    // 1. Create Input Texture
    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = { (uint32_t)width, (uint32_t)height, 1 };
    texDesc.format = wgpu::TextureFormat::RGBA8Unorm;
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    wgpu::Texture inputTexture = device.CreateTexture(&texDesc);

    std::cout << "upload texture" << std::endl;
    // Upload data to Input Texture
    wgpu::TexelCopyTextureInfo dst = {};
    dst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout layout = {};
    layout.offset = 0;
    layout.bytesPerRow = width * 4; // Tightly packed for upload
    layout.rowsPerImage = height;
    queue.WriteTexture(&dst, image, 4 * width * height, &layout, &texDesc.size);

    std::cout << "create output texture" << std::endl;
    // 2. Create Output Texture (Storage)
    wgpu::TextureDescriptor outDesc = texDesc;
    outDesc.usage = wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopySrc;
    wgpu::Texture outputTexture = device.CreateTexture(&outDesc);

    std::cout << "create buffer" << std::endl;
    // 3. Create Uniform Buffer
    FilterParams params = { static_cast<float>(sigma_spatial), static_cast<float>(sigma_range), 0.0f, 0.0f };
    wgpu::BufferDescriptor bufDesc = {};
    bufDesc.size = sizeof(FilterParams);
    bufDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer paramBuffer = device.CreateBuffer(&bufDesc);
    queue.WriteBuffer(paramBuffer, 0, &params, sizeof(FilterParams));

    std::cout << "compile shader" << std::endl;
    // 4. Compile Shader
    wgpu::ShaderSourceWGSL wgslDesc;
    wgslDesc.code = shaderSource;
    wgpu::ShaderModuleDescriptor shaderDesc = {};
    shaderDesc.nextInChain = &wgslDesc;
    shaderDesc.label = "BilateralFilterShader";
    wgpu::ShaderModule shaderModule = device.CreateShaderModule(&shaderDesc);

    std::cout << "compute pipeline" << std::endl;
    // 5. Create Compute Pipeline
    wgpu::ComputePipelineDescriptor pipelineDesc = {};
    pipelineDesc.compute.module = shaderModule;
    pipelineDesc.compute.entryPoint = "main";
    wgpu::ComputePipeline pipeline = device.CreateComputePipeline(&pipelineDesc);

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
    wgpu::BindGroup bindGroup = device.CreateBindGroup(&bindGroupDesc);

    // 7. Dispatch Compute Pass
    wgpu::CommandEncoder encoder = device.CreateCommandEncoder();
    wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
    pass.SetPipeline(pipeline);
    pass.SetBindGroup(0, bindGroup);
    // Workgroups of 16x16
    pass.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16);
    pass.End();

    // 8. Prepare for Readback (Copy Texture -> Buffer)
    // We cannot read textures directly on CPU. We must copy to a MapRead buffer.
    uint32_t alignedBytesPerRow = getAlignedBytesPerRow(width);
    uint32_t bufferSize = alignedBytesPerRow * height;

    wgpu::BufferDescriptor readBufDesc = {};
    readBufDesc.size = bufferSize;
    readBufDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer readBuffer = device.CreateBuffer(&readBufDesc);

    wgpu::TexelCopyTextureInfo srcTex = {};
    srcTex.texture = outputTexture;
    
    wgpu::TexelCopyBufferInfo dstBuf = {};
    dstBuf.buffer = readBuffer;
    dstBuf.layout.bytesPerRow = alignedBytesPerRow;

    encoder.CopyTextureToBuffer(&srcTex, &dstBuf, &texDesc.size);

    wgpu::CommandBuffer commands = encoder.Finish();
    queue.Submit(1, &commands);
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
                
                // Copy row by row to remove padding and put data into 'result'
                for (size_t y = 0; y < height; ++y) {
                    size_t srcIndex = y * alignedBytesPerRow;
                    size_t dstIndex = y * width * 4;
                    std::memcpy(result.data() + dstIndex, mappedData + srcIndex, width * 4);
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
        instance.ProcessEvents();
        emscripten_sleep(100);
    }
    std::cout << "done wgpu" << std::endl;

    std::memcpy(image, result.data(), result.size());
    std::cout << "done memcpy" << std::endl;
}

} // namespace

EXPORTED void bilateral_filter_gpu(uint8_t *image, size_t width, size_t height,
                               double sigma_spatial, double sigma_range,
                               uint8_t color_space) {
  bilateral_gpu::bilateral_filter_gpu(image, width, height, sigma_spatial, sigma_range,
                              color_space);
  
}

/*EXPORTED void bilateral_filter_gpu(uint8_t *image, size_t width, size_t height,
                               double sigma_spatial, double sigma_range,
                               uint8_t color_space) {
    
    // 1. Force a print to prove we entered the function
    std::cout << "Step 1: Entered C++ Function" << std::endl;
    std::cout << "Args: " << width << "x" << height << std::endl;
    std::cout << "Args: " << sigma_spatial << ", " << sigma_range << std::endl;

    // 2. Force a sleep immediately. 
    // If Asyncify is working, this MUST return a Promise to JS.
    std::cout << "Step 2: Sleeping..." << std::endl;
    emscripten_sleep(100); 

    std::cout << "Step 3: Woke up! Asyncify is working." << std::endl;
}*/

