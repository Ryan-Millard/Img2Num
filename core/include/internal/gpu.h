#ifndef GPU_H
#define GPU_H

#include <webgpu/webgpu_cpp.h>
#if defined(__EMSCRIPTEN__)
#include <emscripten/html5.h>
#endif
#include <fstream>
#include <sstream>
#include <string>
#include <iterator>
#include <iostream>
#include <map>

class GPU {

    protected:
        wgpu::Instance instance;
        wgpu::Adapter adapter;
        wgpu::Device device;
        wgpu::Queue queue;

        bool adapter_ready = false;
        bool device_ready = false;
        bool gpu_initialized = false;

        GPU() = default;

        std::map<std::string, std::string> loadedShaders;

    public:
        
        // makes a single global instance that other files can reference
        static GPU& getClassInstance() {
            static GPU gpuInstance;
            return gpuInstance;
        }

        const wgpu::Device& get_device() {
            return device;
        }

        const wgpu::Instance& get_instance() {
            return instance;
        }

        const wgpu::Queue& get_queue() {
            return queue;
        }

        bool is_initialized() {
            return gpu_initialized;
        }

        // Delete copy constructor and assignment operator to prevent duplication
        GPU(const GPU&) = delete;
        GPU& operator=(const GPU&) = delete;
        GPU(GPU&&) = delete;
        GPU& operator=(GPU&&) = delete;

        std::string readWGSLFile(const std::string& filepath) {
            auto it = loadedShaders.find(filepath);
            if (it != loadedShaders.end()) {
                std::cout << "using cached shader" << std::endl;
                return it->second;
            }
            else {
                std::cout << "loading shader from file" << std::endl;
                
                std::ifstream file(filepath, std::ios::in);
                if (!file.is_open()) {
                    std::cerr << "Failed to open file: " << filepath << std::endl;
                    return ""; // Or throw an exception
                }
                std::string shaderSource{std::istreambuf_iterator<char>{file}, {}};
                
                loadedShaders[filepath] = shaderSource;
                file.close();
                return shaderSource;
            }
        }

        wgpu::ComputePipeline createPipeline(const std::string& filename, const std::string& label) {
            wgpu::ShaderSourceWGSL wgsl;
            std::string shaderCode = readWGSLFile(filename);
            wgsl.code = shaderCode.c_str();
            wgpu::ShaderModuleDescriptor md = {};
            md.nextInChain = &wgsl;
            md.label = label.c_str();
            wgpu::ShaderModule sm = device.CreateShaderModule(&md);

            // Debug print
            printShaderError(sm);

            wgpu::ComputePipelineDescriptor cpd = {};
            cpd.compute.module = sm;
            cpd.compute.entryPoint = "main";
            return device.CreateComputePipeline(&cpd);
        };

        static uint32_t getAlignedBytesPerRow(uint32_t width, uint32_t bytesPerPixel = 4) {
            uint32_t unaligned = width * bytesPerPixel;
            uint32_t align = 256;
            return (unaligned + align - 1) & ~(align - 1);
        };

        static void printShaderError(wgpu::ShaderModule shaderModule) {
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

        void init_gpu() { // wgpu::Instance& instance, wgpu::Adapter& adapter, wgpu::Device& device, wgpu::Queue& queue) {
            if (gpu_initialized) return;

            wgpu::InstanceDescriptor instanceDesc = {};
            instance = wgpu::CreateInstance(&instanceDesc);

            if (!instance) {
                std::cerr << "Fatal: WebGPU instance creation failed." << std::endl;
                return;
            }

            // ---------------------------------------------------------
            // 1. Get Adapter
            // ---------------------------------------------------------
            std::cout << "Requesting Adapter..." << std::endl;
            adapter_ready = false;

            instance.RequestAdapter(
                nullptr,
                wgpu::CallbackMode::AllowProcessEvents, // <--- ALLOW EVENTS
                [this](wgpu::RequestAdapterStatus status, wgpu::Adapter a, wgpu::StringView msg) {
                    if (status == wgpu::RequestAdapterStatus::Success) {
                        adapter = std::move(a);
                        std::cout << "Adapter Acquired" << std::endl;
                    } else {
                        std::cerr << "Adapter Failed: " << std::string_view(msg.data ? msg.data : "", msg.length) << std::endl;
                    }
                    adapter_ready = true; // Unblock the loop
                }
            );

            // WAIT LOOP: Yield to browser so it can actually find the adapter
            while (!adapter_ready) {
                instance.ProcessEvents();
                #if defined(__EMSCRIPTEN__)
                emscripten_sleep(10); // Sleep 10ms
                #endif
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
                [this](wgpu::RequestDeviceStatus status, wgpu::Device d, wgpu::StringView msg) {
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
                #if defined(__EMSCRIPTEN__)
                emscripten_sleep(10);
                #endif
            }

            if (!device) {
                std::cerr << "Fatal: Could not get WebGPU Device." << std::endl;
                return;
            }

            queue = device.GetQueue();
            gpu_initialized = true;
            std::cout << "GPU Fully Initialized." << std::endl;
        };
};

#endif