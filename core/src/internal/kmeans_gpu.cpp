
#include "img2num.h"
#include "internal/gpu.h"
#include "internal/kmeans_gpu.h"
#include "internal/Image.h"
#include "internal/LABAPixel.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"
#include "internal/cielab.h"

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <functional>
#include <limits>
#include <numeric>
#include <random>
#include <vector>

// The K-Means++ Initialization Function
template <typename PixelT>
void kMeansPlusPlusInitGpu(const ImageLib::Image<PixelT> &pixels,
                        ImageLib::Image<PixelT> &out_centroids, int k) {
    if (k <= 0) return;

    size_t width = pixels.getWidth();
    size_t height = pixels.getHeight();
    size_t num_pixels = width * height;
    
    std::vector<PixelT> centroids;
    
    // --- WEBGPU SETUP START ---
    // (Assuming 'device' and 'queue' are globally available or passed in)
    // 1. Upload Image Texture
    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = { (uint32_t)width, (uint32_t)height, 1 };
    texDesc.format = wgpu::TextureFormat::RGBA32Float;
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    texDesc.label = "inputTextureInit";
    wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

    // Upload pixel data (Normalization to 0.0-1.0 assumed)
    std::vector<float> gpu_pixels;
    gpu_pixels.reserve(num_pixels * 4);
    for (int i = 0; i < num_pixels; ++i) {
        gpu_pixels.push_back(pixels[i].red / 255.0f);
        gpu_pixels.push_back(pixels[i].green / 255.0f);
        gpu_pixels.push_back(pixels[i].blue / 255.0f);
        gpu_pixels.push_back(pixels[i].alpha / 255.0f); // Alpha
    }
    
    wgpu::TexelCopyTextureInfo texDst = {};
    texDst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout texLayout = {};
    texLayout.bytesPerRow = width * 16;
    texLayout.rowsPerImage = height;
    GPU::getClassInstance().get_queue().WriteTexture(&texDst, gpu_pixels.data(), gpu_pixels.size() * 4, &texLayout, &texDesc.size);

    // 2. Create MinDist Buffer (Storage)
    // Initialize with FLT_MAX so the first centroid overwrites everything
    std::vector<float> initial_dists(num_pixels, std::numeric_limits<float>::max());
    
    wgpu::BufferDescriptor distDesc = {};
    distDesc.size = num_pixels * sizeof(float);
    distDesc.usage = wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopySrc | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer minDistBuffer = GPU::getClassInstance().get_device().CreateBuffer(&distDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(minDistBuffer, 0, initial_dists.data(), distDesc.size);

    // 3. Create Uniform Buffer (For passing new centroid color)
    struct CentroidParams {
        float r, g, b, a;
        uint32_t width;
        uint32_t pad[3]; // Padding to align to 16 bytes
    };
    wgpu::BufferDescriptor uniDesc = {};
    uniDesc.size = sizeof(CentroidParams);
    uniDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer paramBuffer = GPU::getClassInstance().get_device().CreateBuffer(&uniDesc);

    // 4. Create Readback Buffer
    wgpu::BufferDescriptor readDesc = {};
    readDesc.size = num_pixels * sizeof(float);
    readDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer readBuffer = GPU::getClassInstance().get_device().CreateBuffer(&readDesc);

    // 5. Compile Shader & Pipeline
    wgpu::ShaderSourceWGSL wgslDesc;
    wgslDesc.code = updateDistShader;
    wgpu::ShaderModuleDescriptor shaderDesc = {};
    shaderDesc.nextInChain = &wgslDesc;
    shaderDesc.label = "updateDistShader";
    wgpu::ShaderModule shaderModule = GPU::getClassInstance().get_device().CreateShaderModule(&shaderDesc);

    wgpu::ComputePipelineDescriptor pipeDesc = {};
    pipeDesc.compute.module = shaderModule;
    pipeDesc.compute.entryPoint = "main";
    wgpu::ComputePipeline pipeline = GPU::getClassInstance().get_device().CreateComputePipeline(&pipeDesc);

    // 6. Bind Group
    wgpu::BindGroupEntry entries[3];
    entries[0].binding = 0; entries[0].textureView = inputTexture.CreateView();
    entries[1].binding = 1; entries[1].buffer = minDistBuffer; entries[1].size = distDesc.size;
    entries[2].binding = 2; entries[2].buffer = paramBuffer;   entries[2].size = uniDesc.size;
    
    wgpu::BindGroupDescriptor bgDesc = {};
    bgDesc.layout = pipeline.GetBindGroupLayout(0);
    bgDesc.entryCount = 3;
    bgDesc.entries = entries;
    wgpu::BindGroup bindGroup = GPU::getClassInstance().get_device().CreateBindGroup(&bgDesc);
    // --- WEBGPU SETUP END ---

    // RNG Setup
    std::random_device rd;
    std::mt19937 gen(rd());

    // --- Step 1: Choose the first centroid randomly ---
    std::uniform_int_distribution<> dis(0, num_pixels - 1);
    int first_index = dis(gen);
    centroids.push_back(pixels[first_index]);

    // --- Step 2 & 3: Repeat until we have k centroids ---
    for (int i = 1; i < k; ++i) {
        
        // A. Upload Current Centroid to GPU
        PixelT c = centroids.back();
        CentroidParams params = {
            c.red / 255.0f, c.green / 255.0f, c.blue / 255.0f, 1.0f,
            (uint32_t)width
        };
        GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params, sizeof(CentroidParams));

        // B. Dispatch Shader (Updates min_dist buffer on GPU)
        wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
        wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
        pass.SetPipeline(pipeline);
        pass.SetBindGroup(0, bindGroup);
        pass.DispatchWorkgroups((num_pixels + 255) / 256, 1, 1);
        pass.End();

        // C. Copy Result to ReadBuffer
        encoder.CopyBufferToBuffer(minDistBuffer, 0, readBuffer, 0, readDesc.size);
        wgpu::CommandBuffer commands = encoder.Finish();
        GPU::getClassInstance().get_queue().Submit(1, &commands);

        // D. Map and Read
        bool done = false;
        readBuffer.MapAsync(wgpu::MapMode::Read, 0, readDesc.size, wgpu::CallbackMode::AllowProcessEvents,
            [&](wgpu::MapAsyncStatus status, wgpu::StringView) {
                if (status == wgpu::MapAsyncStatus::Success) {
                    const float* dists = (const float*)readBuffer.GetConstMappedRange();
                    
                    // --- CPU SIDE: Selection Logic ---
                    double sum_dist_sq = 0.0;
                    
                    // 1. Sum (We have to iterate anyway for roulette, so sum here)
                    // Note: dists[] contains the SQUARED distance because shader calculated distSq
                    for(size_t j=0; j<num_pixels; ++j) {
                        sum_dist_sq += dists[j];
                    }

                    // 2. Select
                    std::uniform_real_distribution<> dist_selector(0.0, sum_dist_sq);
                    double random_value = dist_selector(gen);
                    double current_sum = 0.0;
                    int selected_index = -1;

                    for (size_t j = 0; j < num_pixels; ++j) {
                        current_sum += dists[j];
                        if (current_sum >= random_value) {
                            selected_index = j;
                            break;
                        }
                    }

                    if (selected_index == -1) selected_index = num_pixels - 1;
                    
                    // Add new centroid
                    centroids.push_back(pixels[selected_index]);
                    
                    readBuffer.Unmap();
                    done = true;
                }
            });

        // E. Wait for GPU
        while (!done) {
            GPU::getClassInstance().get_instance().ProcessEvents();
            emscripten_sleep(1); 
        }
    }

    std::copy(centroids.begin(), centroids.end(), out_centroids.begin());
}

void kmeans_gpu(const uint8_t *data, uint8_t *out_data, int32_t *out_labels,
            const int32_t width, const int32_t height, const int32_t k,
            const int32_t max_iter, const uint8_t color_space) {
  ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
  pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
  const int32_t num_pixels{pixels.getSize()};

  // width = k, height = 1
  // k centroids, initialized to rgba(0,0,0,255)
  // Init of each pixel is from default in Image constructor
  ImageLib::Image<ImageLib::RGBAPixel<float>> centroids{k, 1};
  ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab{k, 1};
  std::vector<int32_t> labels(num_pixels, -1);

  ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(),
                                                  pixels.getHeight());
  
  /*if (color_space == COLOR_SPACE_OPTION_CIELAB) {
    for (int i{0}; i < pixels.getSize(); ++i) {
      rgb_to_lab<float, float>(pixels[i], lab[i]);
    }
  }*/

  std::cout << "starting" << std::endl;
  // Step 2: Initialize centroids randomly
  kMeansPlusPlusInitGpu<ImageLib::RGBAPixel<float>>(pixels, centroids, k);
  std::cout << "kmeans++ init done" << std::endl;
  /*switch (color_space) {
  case COLOR_SPACE_OPTION_RGB: {
    kMeansPlusPlusInit<ImageLib::RGBAPixel<float>>(pixels, centroids, k);
    break;
  }
  case COLOR_SPACE_OPTION_CIELAB: {
    kMeansPlusPlusInit<ImageLib::LABAPixel<float>>(lab, centroids_lab, k);
    break;
  }
  }*/

  // Step 3: Run k-means iterations

  // image
  wgpu::TextureDescriptor texDesc = {};
  texDesc.size = { (uint32_t)width, (uint32_t)height, 1 };
  texDesc.format = wgpu::TextureFormat::RGBA32Float;
  texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
  texDesc.label = "inputTexture";
  wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

  wgpu::TexelCopyTextureInfo dst = {};
  dst.texture = inputTexture;
  wgpu::TexelCopyBufferLayout layout = {};
  layout.offset = 0;
  layout.bytesPerRow = width * 16; // Tightly packed for upload
  layout.rowsPerImage = height;

  std::vector<float> pixels_; // rgba
  for(auto &p: pixels.getData()) {
    pixels_.push_back(p.red / 255.0f);
    pixels_.push_back(p.green / 255.0f);
    pixels_.push_back(p.blue / 255.0f);
    pixels_.push_back(p.alpha / 255.0f);
  }

  GPU::getClassInstance().get_queue().WriteTexture(&dst, pixels_.data(), pixels_.size() * sizeof(float), &layout, &texDesc.size);

  // centroids
  wgpu::TextureDescriptor centroidDesc = {};
  centroidDesc.size = { (uint32_t)k, 1, 1 };
  centroidDesc.format = wgpu::TextureFormat::RGBA32Float;
  centroidDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc;
  centroidDesc.label = "centroidTexture";
  wgpu::Texture centroidTexture = GPU::getClassInstance().get_device().CreateTexture(&centroidDesc);

  wgpu::TexelCopyTextureInfo cdst = {};
  cdst.texture = centroidTexture;
  wgpu::TexelCopyBufferLayout clayout = {};
  clayout.offset = 0;
  clayout.bytesPerRow = k * 16; // Tightly packed for upload
  clayout.rowsPerImage = 1;

  std::vector<float> centroids_; // rgba
  for(auto &p: centroids.getData()) {
    centroids_.push_back(p.red / 255.0f);
    centroids_.push_back(p.green / 255.0f);
    centroids_.push_back(p.blue / 255.0f);
    centroids_.push_back(p.alpha / 255.0f);
  }


  GPU::getClassInstance().get_queue().WriteTexture(&cdst, centroids_.data(), centroids_.size() * sizeof(float), &clayout, &centroidDesc.size);

  // labels
  wgpu::TextureDescriptor labelDesc = {};
  labelDesc.size = { (uint32_t)width, (uint32_t)height, 1 };
  labelDesc.format = wgpu::TextureFormat::RGBA32Uint;
  labelDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding | wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc;
  labelDesc.label = "labelTexture";
  wgpu::Texture labelTexture = GPU::getClassInstance().get_device().CreateTexture(&labelDesc);

  // params
  Params params = { (uint32_t)num_pixels, (uint32_t)k};
  wgpu::BufferDescriptor bufDesc = {};
  bufDesc.size = sizeof(Params);
  bufDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
  wgpu::Buffer paramBuffer = GPU::getClassInstance().get_device().CreateBuffer(&bufDesc);
  GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params, sizeof(Params));

  // centroid accumulator
  std::vector<ClusterAccumulator> reset_centroids(k, { 0, 0, 0, 0 });
  wgpu::BufferDescriptor accDesc = {};
  accDesc.size = sizeof(ClusterAccumulator) * k;
  accDesc.usage = wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopyDst;
  wgpu::Buffer accBuffer = GPU::getClassInstance().get_device().CreateBuffer(&accDesc);
  GPU::getClassInstance().get_queue().WriteBuffer(accBuffer, 0, reset_centroids.data(), accDesc.size);

  // shaders
  wgpu::ShaderSourceWGSL wgslDesc1;
  wgslDesc1.code = assignShader;
  wgpu::ShaderModuleDescriptor shaderDesc1 = {};
  shaderDesc1.nextInChain = &wgslDesc1;
  shaderDesc1.label = "assignShader";
  wgpu::ShaderModule shaderModule1 = GPU::getClassInstance().get_device().CreateShaderModule(&shaderDesc1);

  wgpu::ShaderSourceWGSL wgslDesc2;
  wgslDesc2.code = updateShader;
  wgpu::ShaderModuleDescriptor shaderDesc2 = {};
  shaderDesc2.nextInChain = &wgslDesc2;
  shaderDesc2.label = "updateShader";
  wgpu::ShaderModule shaderModule2 = GPU::getClassInstance().get_device().CreateShaderModule(&shaderDesc2);

  wgpu::ShaderSourceWGSL wgslDesc3;
  wgslDesc3.code = resolveShader;
  wgpu::ShaderModuleDescriptor shaderDesc3 = {};
  shaderDesc3.nextInChain = &wgslDesc3;
  shaderDesc3.label = "resolveShader";
  wgpu::ShaderModule shaderModule3 = GPU::getClassInstance().get_device().CreateShaderModule(&shaderDesc3);

  // pipelines
  wgpu::ComputePipelineDescriptor pipelineDesc1 = {};
  pipelineDesc1.compute.module = shaderModule1;
  pipelineDesc1.compute.entryPoint = "main";
  wgpu::ComputePipeline pipeline1 = GPU::getClassInstance().get_device().CreateComputePipeline(&pipelineDesc1);

  wgpu::ComputePipelineDescriptor pipelineDesc2 = {};
  pipelineDesc2.compute.module = shaderModule2;
  pipelineDesc2.compute.entryPoint = "main";
  wgpu::ComputePipeline pipeline2 = GPU::getClassInstance().get_device().CreateComputePipeline(&pipelineDesc2);

  wgpu::ComputePipelineDescriptor pipelineDesc3 = {};
  pipelineDesc3.compute.module = shaderModule3;
  pipelineDesc3.compute.entryPoint = "main";
  wgpu::ComputePipeline pipeline3 = GPU::getClassInstance().get_device().CreateComputePipeline(&pipelineDesc3);

  // binding groups
  wgpu::BindGroupDescriptor bindGroupDesc1 = {};
  bindGroupDesc1.layout = pipeline1.GetBindGroupLayout(0);
  wgpu::BindGroupEntry entries1[4];
  // Entry 0: Input Texture View
  entries1[0].binding = 0;
  entries1[0].textureView = inputTexture.CreateView();
  // Entry 1: Centroid Texture View
  entries1[1].binding = 1;
  entries1[1].textureView = centroidTexture.CreateView();
  // Entry 2: Label Texture View
  entries1[2].binding = 2;
  entries1[2].textureView = labelTexture.CreateView();
  // Entry 2: Uniform Buffer
  entries1[3].binding = 3;
  entries1[3].buffer = paramBuffer;
  entries1[3].size = sizeof(Params);
  bindGroupDesc1.entryCount = 4;
  bindGroupDesc1.entries = entries1;
  wgpu::BindGroup bindGroup1 = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc1);

  wgpu::BindGroupDescriptor bindGroupDesc2 = {};
  bindGroupDesc2.layout = pipeline2.GetBindGroupLayout(0);
  wgpu::BindGroupEntry entries2[4];
  // Entry 0: Input Texture View
  entries2[0].binding = 0;
  entries2[0].textureView = inputTexture.CreateView();
  // Entry 1: Label Texture View
  entries2[1].binding = 1;
  entries2[1].textureView = labelTexture.CreateView();
  // Entry 2: Label Texture View
  entries2[2].binding = 2;
  entries2[2].buffer = accBuffer;
  entries2[2].size = sizeof(ClusterAccumulator) * k;
  // Entry 2: Uniform Buffer
  entries2[3].binding = 3;
  entries2[3].buffer = paramBuffer;
  entries2[3].size = sizeof(Params);
  bindGroupDesc2.entryCount = 4;
  bindGroupDesc2.entries = entries2;
  wgpu::BindGroup bindGroup2 = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc2);

  wgpu::BindGroupDescriptor bindGroupDesc3 = {};
  bindGroupDesc3.layout = pipeline3.GetBindGroupLayout(0);
  wgpu::BindGroupEntry entries3[2];
  entries3[0].binding = 0; 
  entries3[0].buffer = accBuffer; 
  entries3[0].size = accDesc.size;
  entries3[1].binding = 1; 
  entries3[1].textureView = centroidTexture.CreateView(); 
  bindGroupDesc3.entryCount = 2;
  bindGroupDesc3.entries = entries3;
  wgpu::BindGroup bindGroup3 = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc3);

  uint32_t wgX = (width + 15) / 16;
  uint32_t wgY = (height + 15) / 16;

  // Label Readback RGBA32Uint is 16 bytes/ pixel
  uint32_t bytesPerRowLabels = (width * 16 + 255) & ~255; // Align to 256 bytes
  wgpu::BufferDescriptor readLabelsDesc = {};
  readLabelsDesc.size = bytesPerRowLabels * height;
  readLabelsDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
  wgpu::Buffer readLabelsBuffer = GPU::getClassInstance().get_device().CreateBuffer(&readLabelsDesc);
  
  // Centroid Readback
  uint32_t bytesPerRowCentroids = (k * 16 + 255) & ~255; // RGBA32Float is 16 bytes/pixel
  wgpu::BufferDescriptor readCentroidsDesc = {};
  readCentroidsDesc.size = bytesPerRowCentroids; // Height is 1
  readCentroidsDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
  wgpu::Buffer readCentroidsBuffer = GPU::getClassInstance().get_device().CreateBuffer(&readCentroidsDesc);

  std::cout << "start iterations" << std::endl;
  for (int32_t iter{0}; iter < max_iter; ++iter) {
    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
    GPU::getClassInstance().get_queue().WriteBuffer(accBuffer, 0, reset_centroids.data(), accDesc.size);
    
    wgpu::ComputePassEncoder pass1 = encoder.BeginComputePass();
    pass1.SetPipeline(pipeline1);
    pass1.SetBindGroup(0, bindGroup1);
    pass1.DispatchWorkgroups(wgX, wgY);
    pass1.End();
  
    wgpu::ComputePassEncoder pass2 = encoder.BeginComputePass();
    pass2.SetPipeline(pipeline2);
    pass2.SetBindGroup(0, bindGroup2);
    pass2.DispatchWorkgroups(wgX, wgY);
    pass2.End();
  
    wgpu::ComputePassEncoder pass3 = encoder.BeginComputePass();
    pass3.SetPipeline(pipeline3);
    pass3.SetBindGroup(0, bindGroup3);
    pass3.DispatchWorkgroups((k + 255) / 256, 1);
    pass3.End();

    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);

    GPU::getClassInstance().get_instance().ProcessEvents();
    emscripten_sleep(1);
  }

  std::cout << "done iterations" << std::endl;
  // 3. Readback (After Loop Finishes)
  wgpu::CommandEncoder readEncoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
  
  // Copy Labels
  wgpu::TexelCopyTextureInfo srcLabels = {};
  srcLabels.texture = labelTexture;
  wgpu::TexelCopyBufferInfo dstLabels = {};
  dstLabels.buffer = readLabelsBuffer;
  dstLabels.layout.bytesPerRow = bytesPerRowLabels;
  dstLabels.layout.rowsPerImage = height;
  readEncoder.CopyTextureToBuffer(&srcLabels, &dstLabels, &labelDesc.size);
  
  // Copy Centroids
  wgpu::TexelCopyTextureInfo srcCentroids = {};
  srcCentroids.texture = centroidTexture;
  wgpu::TexelCopyBufferInfo dstCentroids = {};
  dstCentroids.buffer = readCentroidsBuffer;
  dstCentroids.layout.bytesPerRow = bytesPerRowCentroids;
  dstCentroids.layout.rowsPerImage = 1;
  readEncoder.CopyTextureToBuffer(&srcCentroids, &dstCentroids, &centroidDesc.size);
  
  wgpu::CommandBuffer readCmd = readEncoder.Finish();
  GPU::getClassInstance().get_queue().Submit(1, &readCmd);
  
  // 4. Map Async & Wait
  bool done = false;
  std::cout << "read out" << std::endl;
  // Map Labels
  readLabelsBuffer.MapAsync(
      wgpu::MapMode::Read, 
      0, 
      readLabelsDesc.size, 
      wgpu::CallbackMode::AllowProcessEvents,
      [&](wgpu::MapAsyncStatus status, wgpu::StringView msg) {
          if (status == wgpu::MapAsyncStatus::Success) {
              // rgba uint32
              // const uint32_t* mappedData = (const uint32_t*)readLabelsBuffer.GetConstMappedRange();
              const uint8_t* mappedData = (const uint8_t*)readLabelsBuffer.GetConstMappedRange();
              // ... Copy data to your C++ vector ...
              // Copy row by row to remove padding and put data into 'result'
              std::cout << "mapping labels" << std::endl;
              for (size_t y = 0; y < height; ++y) {
                const uint8_t* rowPtr = mappedData + (y * bytesPerRowLabels);
                for (size_t x = 0; x < width; ++x) {
                  //size_t srcIndex = y * bytesPerRowLabels + x * 16;
                  const uint8_t* pixelPtr = rowPtr + (x * 16);
                  uint32_t r = *(const uint32_t*)pixelPtr;

                  size_t dstIndex = y * width + x;
                  // just grab the first one (r)
                  // const uint32_t l = *(mappedData + srcIndex);
                  labels[dstIndex] = static_cast<int32_t>(r);
                }
                  // std::memcpy(labels.data() + dstIndex, mappedData + srcIndex, width * sizeof(int32_t));
              }
              readLabelsBuffer.Unmap();
          }
      });
  
  // Map Centroids
  readCentroidsBuffer.MapAsync(
      wgpu::MapMode::Read, 
      0, 
      readCentroidsDesc.size, 
      wgpu::CallbackMode::AllowProcessEvents,
      [&](wgpu::MapAsyncStatus status, wgpu::StringView msg) {
          if (status == wgpu::MapAsyncStatus::Success) {
               const float* mappedData = (const float*)readCentroidsBuffer.GetConstMappedRange();
               // ... Copy data to your C++ vector ...
               std::cout << "mapping centroids" << std::endl;
               std::memcpy(centroids.getData().data(), mappedData, k);
               readCentroidsBuffer.Unmap();
               done = true; // Signal completion
          }
      });
  
  while (!done) {
    GPU::getClassInstance().get_instance().ProcessEvents();
    emscripten_sleep(10);
  }
  
  // Write the final centroid values to each pixel in the cluster
  for (int32_t i = 0; i < num_pixels; ++i) {
    const int32_t cluster = labels[i];
    out_data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].red);
    out_data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].green);
    out_data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].blue);
    out_data[i * 4 + 3] = 255;
  }

  // Write labels to out_labels
  std::cout << "copying labels out" << std::endl;
  std::memcpy(out_labels, labels.data(), labels.size() * sizeof(int32_t));
}
