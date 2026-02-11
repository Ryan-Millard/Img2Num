#ifndef GPU_H
#define GPU_H

#include <webgpu/webgpu_cpp.h>
#include <emscripten/html5.h>
#include <iostream>

inline bool gpu_initialized = false;
inline bool adapter_ready = false;
inline bool device_ready = false;

inline wgpu::Instance instance;
inline wgpu::Adapter adapter;
inline wgpu::Device device;
inline wgpu::Queue queue;

// Helper to align rows for buffer reading (WebGPU requirement: 256 bytes per row)
inline uint32_t getAlignedBytesPerRow(uint32_t width) {
    uint32_t bytesPerPixel = 4;
    uint32_t unaligned = width * bytesPerPixel;
    uint32_t align = 256;
    return (unaligned + align - 1) & ~(align - 1);
};

inline void printShaderError(wgpu::ShaderModule shaderModule) {
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

inline void init_gpu() { // wgpu::Instance& instance, wgpu::Adapter& adapter, wgpu::Device& device, wgpu::Queue& queue) {
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
};

#endif