
#include "internal/kmeans_gpu.h"

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <functional>
#include <limits>
#include <numeric>
#include <random>
#include <type_traits>  // Required for std::is_same_v
#include <vector>

#include "img2num.h"
#include "internal/Image.h"
#include "internal/LABAPixel.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"
#include "internal/cielab.h"
#include "internal/gpu.h"

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB{0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB{1};

struct Params {
    uint32_t numPoints;
    uint32_t numCentroids;
};

struct ClusterAccumulator {
    int32_t sumR;
    int32_t sumG;
    int32_t sumB;
    uint32_t count;
};

// The K-Means++ Initialization Function
template <typename PixelT>
void kMeansPlusPlusInitGpu(const ImageLib::Image<PixelT>& pixels,
                           ImageLib::Image<PixelT>& out_centroids, int k,
                           const uint8_t color_space) {
    if (k <= 0) return;

    size_t width = pixels.getWidth();
    size_t height = pixels.getHeight();
    size_t num_pixels = width * height;

    std::vector<PixelT> centroids;

    // --- WEBGPU SETUP START ---
    // (Assuming 'device' and 'queue' are globally available or passed in)
    // 1. Upload Image Texture
    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = {static_cast<uint32_t>(width), static_cast<uint32_t>(height), 1};
    texDesc.format = wgpu::TextureFormat::RGBA32Float;
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    texDesc.label = "inputTextureInit";
    wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

    // Upload pixel data (Normalization to 0.0-1.0 assumed)
    std::vector<float> gpu_pixels;
    gpu_pixels.reserve(num_pixels * 4);

    for (int i = 0; i < num_pixels; i++) {
        PixelT p = pixels[i];
        if constexpr (std::is_same_v<PixelT, ImageLib::LABAPixel<float>>) {
            gpu_pixels.push_back(p.l / 255.0f);
            gpu_pixels.push_back(p.a / 255.0f);
            gpu_pixels.push_back(p.b / 255.0f);
            gpu_pixels.push_back(p.alpha / 255.0f);
        } else {
            gpu_pixels.push_back(p.red / 255.0f);
            gpu_pixels.push_back(p.green / 255.0f);
            gpu_pixels.push_back(p.blue / 255.0f);
            gpu_pixels.push_back(p.alpha / 255.0f);
        }
    }

    wgpu::TexelCopyTextureInfo texDst = {};
    texDst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout texLayout = {};
    texLayout.bytesPerRow = width * 16;
    texLayout.rowsPerImage = height;
    GPU::getClassInstance().get_queue().WriteTexture(
        &texDst, gpu_pixels.data(), gpu_pixels.size() * 4, &texLayout, &texDesc.size);

    // 2. Create MinDist Buffer (Storage)
    // Initialize with FLT_MAX so the first centroid overwrites everything
    std::vector<float> initial_dists(num_pixels, std::numeric_limits<float>::max());

    wgpu::BufferDescriptor distDesc = {};
    distDesc.size = num_pixels * sizeof(float);
    distDesc.usage =
        wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopySrc | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer minDistBuffer = GPU::getClassInstance().get_device().CreateBuffer(&distDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(minDistBuffer, 0, initial_dists.data(),
                                                    distDesc.size);

    // 3. Create Uniform Buffer (For passing new centroid color)
    struct CentroidParams {
        float r, g, b, a;
        uint32_t width;
        uint32_t pad[3];  // Padding to align to 16 bytes
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
    wgpu::ComputePipeline pipeline =
        GPU::getClassInstance().createPipeline("dist_shader", "updateDistShader");

    // 6. Bind Group
    wgpu::BindGroupEntry entries[3];
    entries[0].binding = 0;
    entries[0].textureView = inputTexture.CreateView();
    entries[1].binding = 1;
    entries[1].buffer = minDistBuffer;
    entries[1].size = distDesc.size;
    entries[2].binding = 2;
    entries[2].buffer = paramBuffer;
    entries[2].size = uniDesc.size;

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
        CentroidParams params;
        if constexpr (std::is_same_v<PixelT, ImageLib::LABAPixel<float>>) {
            params = CentroidParams{c.l / 255.0f, c.a / 255.0f, c.b / 255.0f, 1.0f,
                                    static_cast<uint32_t>(width)};
        } else {
            params = CentroidParams{c.red / 255.0f, c.green / 255.0f, c.blue / 255.0f, 1.0f,
                                    static_cast<uint32_t>(width)};
        }

        GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params,
                                                        sizeof(CentroidParams));

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
        readBuffer.MapAsync(
            wgpu::MapMode::Read, 0, readDesc.size, wgpu::CallbackMode::AllowProcessEvents,
            [&](wgpu::MapAsyncStatus status, wgpu::StringView) {
                if (status == wgpu::MapAsyncStatus::Success) {
                    const float* dists = (const float*)readBuffer.GetConstMappedRange();

                    // --- CPU SIDE: Selection Logic ---
                    double sum_dist_sq = 0.0;

                    // 1. Sum (We have to iterate anyway for roulette, so sum here)
                    // Note: dists[] contains the SQUARED distance because shader calculated distSq
                    for (size_t j = 0; j < num_pixels; ++j) {
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
#if defined(__EMSCRIPTEN__)
            emscripten_sleep(1);
#endif
        }
    }

    std::copy(centroids.begin(), centroids.end(), out_centroids.begin());
}

void setup(
    ImageLib::Image<ImageLib::RGBAPixel<float>>& pixels, 
    ImageLib::Image<ImageLib::LABAPixel<float>>& lab, 
    ImageLib::Image<ImageLib::RGBAPixel<float>>& centroids,
    ImageLib::Image<ImageLib::LABAPixel<float>>& centroids_lab,
    const int32_t width,
    const int32_t height,
    const int32_t k,
    wgpu::Texture& labelTexture, 
    wgpu::Texture& centroidTexture,
    wgpu::TextureDescriptor& labelDesc,
    wgpu::TextureDescriptor& centroidDesc,
    wgpu::ComputePipeline& pipeline1,
    wgpu::ComputePipeline& pipeline2, 
    wgpu::BindGroup& bindGroup1,
    wgpu::BindGroup& bindGroup2,
    const uint8_t color_space
) {
    int bytesPerPixel{16};
    const int32_t num_pixels{pixels.getSize()};

    wgpu::TextureDescriptor texDesc = {};
    texDesc.size = {static_cast<uint32_t>(width), static_cast<uint32_t>(height), 1};
    texDesc.format = wgpu::TextureFormat::RGBA32Float;
    texDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst;
    texDesc.label = "inputTexture";
    wgpu::Texture inputTexture = GPU::getClassInstance().get_device().CreateTexture(&texDesc);

    wgpu::TexelCopyTextureInfo dst = {};
    dst.texture = inputTexture;
    wgpu::TexelCopyBufferLayout layout = {};
    layout.offset = 0;
    layout.bytesPerRow = width * bytesPerPixel;  // Tightly packed for upload
    layout.rowsPerImage = height;

    std::vector<float> pixels_;
    for (int i = 0; i < num_pixels; i++) {
        switch (color_space) {
            case COLOR_SPACE_OPTION_RGB: {
                auto p = pixels[i];
                pixels_.push_back(p.red / 255.0f);
                pixels_.push_back(p.green / 255.0f);
                pixels_.push_back(p.blue / 255.0f);
                pixels_.push_back(p.alpha / 255.0f);
                break;
            }
            case COLOR_SPACE_OPTION_CIELAB: {
                auto p = lab[i];
                pixels_.push_back(p.l / 255.0f);
                pixels_.push_back(p.a / 255.0f);
                pixels_.push_back(p.b / 255.0f);
                pixels_.push_back(p.alpha / 255.0f);
                break;
            }
        }
    }

    GPU::getClassInstance().get_queue().WriteTexture(
        &dst, pixels_.data(), pixels_.size() * sizeof(float), &layout, &texDesc.size);

    // centroids
    centroidDesc.size = {static_cast<uint32_t>(k), 1, 1};
    centroidDesc.format = wgpu::TextureFormat::RGBA32Float;
    centroidDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding |
                         wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc;
    centroidDesc.label = "centroidTexture";
    centroidTexture =
        GPU::getClassInstance().get_device().CreateTexture(&centroidDesc);

    wgpu::TexelCopyTextureInfo cdst = {};
    cdst.texture = centroidTexture;
    wgpu::TexelCopyBufferLayout clayout = {};
    clayout.offset = 0;
    clayout.bytesPerRow = k * bytesPerPixel;  // Tightly packed for upload
    clayout.rowsPerImage = 1;

    std::vector<float> centroids_;  // rgba
    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            for (int i = 0; i < k; i++) {
                auto p = centroids[i];
                centroids_.push_back(p.red / 255.0f);
                centroids_.push_back(p.green / 255.0f);
                centroids_.push_back(p.blue / 255.0f);
                centroids_.push_back(p.alpha / 255.0f);
            }
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
            for (int i = 0; i < k; i++) {
                auto p = centroids_lab[i];
                centroids_.push_back(p.l / 255.0f);
                centroids_.push_back(p.a / 255.0f);
                centroids_.push_back(p.b / 255.0f);
                centroids_.push_back(p.alpha / 255.0f);
            }
            break;
        }
    }

    GPU::getClassInstance().get_queue().WriteTexture(
        &cdst, centroids_.data(), centroids_.size() * sizeof(float), &clayout, &centroidDesc.size);

    // labels
    labelDesc.size = {static_cast<uint32_t>(width), static_cast<uint32_t>(height), 1};
    labelDesc.format = wgpu::TextureFormat::RGBA32Uint;
    labelDesc.usage = wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding |
                      wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc;
    labelDesc.label = "labelTexture";
    labelTexture = GPU::getClassInstance().get_device().CreateTexture(&labelDesc);

    // params
    Params params = {static_cast<uint32_t>(num_pixels), static_cast<uint32_t>(k)};
    wgpu::BufferDescriptor bufDesc = {};
    bufDesc.size = sizeof(Params);
    bufDesc.usage = wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer paramBuffer = GPU::getClassInstance().get_device().CreateBuffer(&bufDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(paramBuffer, 0, &params, sizeof(Params));

    // centroid accumulator
    std::vector<ClusterAccumulator> reset_centroids(k, {0, 0, 0, 0});
    wgpu::BufferDescriptor accDesc = {};
    accDesc.size = sizeof(ClusterAccumulator) * k;
    accDesc.usage = wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer accBuffer = GPU::getClassInstance().get_device().CreateBuffer(&accDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(accBuffer, 0, reset_centroids.data(),
                                                    accDesc.size);

    // shaders
    pipeline1 = GPU::getClassInstance().createPipeline("assign_update_shader", "assignUpdateShader");
    pipeline2 = GPU::getClassInstance().createPipeline("resolve_shader", "resolveShader");

    // binding groups
    wgpu::BindGroupDescriptor bindGroupDesc1 = {};
    bindGroupDesc1.layout = pipeline1.GetBindGroupLayout(0);
    wgpu::BindGroupEntry entries1[5];  // 4
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

    entries1[4].binding = 4;
    entries1[4].buffer = accBuffer;
    entries1[4].size = sizeof(ClusterAccumulator) * k;

    bindGroupDesc1.entryCount = 5;  // 4;
    bindGroupDesc1.entries = entries1;
    bindGroup1 = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc1);

    wgpu::BindGroupDescriptor bindGroupDesc2 = {};
    bindGroupDesc2.layout = pipeline2.GetBindGroupLayout(0);
    wgpu::BindGroupEntry entries2[2];
    entries2[0].binding = 0;
    entries2[0].buffer = accBuffer;
    entries2[0].size = accDesc.size;
    entries2[1].binding = 1;
    entries2[1].textureView = centroidTexture.CreateView();
    bindGroupDesc2.entryCount = 2;
    bindGroupDesc2.entries = entries2;
    bindGroup2 = GPU::getClassInstance().get_device().CreateBindGroup(&bindGroupDesc2);
}

void kmeans_gpu(const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
                const int32_t height, const int32_t k, const int32_t max_iter,
                const uint8_t color_space) {
    ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
    pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
    const int32_t num_pixels{pixels.getSize()};

    // width = k, height = 1
    // k centroids, initialized to rgba(0,0,0,255)
    // Init of each pixel is from default in Image constructor
    ImageLib::Image<ImageLib::RGBAPixel<float>> centroids{k, 1};
    ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab{k, 1};
    std::vector<int32_t> labels(num_pixels, -1);

    ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(), pixels.getHeight());

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int i{0}; i < pixels.getSize(); ++i) {
            rgb_to_lab<float, float>(pixels[i], lab[i]);
        }
    }

    std::cout << "starting" << std::endl;
    // Step 2: Initialize centroids

    switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            kMeansPlusPlusInitGpu<ImageLib::RGBAPixel<float>>(pixels, centroids, k, color_space);
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
            kMeansPlusPlusInitGpu<ImageLib::LABAPixel<float>>(lab, centroids_lab, k, color_space);
            break;
        }
    }
    std::cout << "kmeans++ init done" << std::endl;

    // Step 3: Run k-means iterations

    int bytesPerPixel{16};  // float pixels

    // shaders - 2 pipelines:
    // 1. assign and update clusters
    // 2. resolve cluster centroids
    wgpu::ComputePipeline pipeline1;
    wgpu::ComputePipeline pipeline2;
    wgpu::BindGroup bindGroup1;
    wgpu::BindGroup bindGroup2;
    wgpu::Texture labelTexture;
    wgpu::Texture centroidTexture;
    wgpu::TextureDescriptor labelDesc = {};
    wgpu::TextureDescriptor centroidDesc = {};

    // setup all textures and buffers needed for the kmeans loop on gpu
    setup(
        pixels, lab, centroids, centroids_lab, 
        width, height, k, 
        labelTexture, centroidTexture,
        labelDesc, centroidDesc,
        pipeline1, pipeline2, bindGroup1, bindGroup2, 
        color_space
    );

    uint32_t wgX = (width + 15) / 16;
    uint32_t wgY = (height + 15) / 16;

    // Label Readback RGBA32Uint is 16 bytes/ pixel
    uint32_t bytesPerRowLabels =
        GPU::getAlignedBytesPerRow(width, static_cast<uint32_t>(bytesPerPixel));
    wgpu::BufferDescriptor readLabelsDesc = {};
    readLabelsDesc.size = bytesPerRowLabels * height;
    readLabelsDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer readLabelsBuffer =
        GPU::getClassInstance().get_device().CreateBuffer(&readLabelsDesc);

    // Centroid Readback
    uint32_t bytesPerRowCentroids =
        GPU::getAlignedBytesPerRow(width, static_cast<uint32_t>(bytesPerPixel));
    wgpu::BufferDescriptor readCentroidsDesc = {};
    readCentroidsDesc.size = bytesPerRowCentroids;  // Height is 1
    readCentroidsDesc.usage = wgpu::BufferUsage::MapRead | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer readCentroidsBuffer =
        GPU::getClassInstance().get_device().CreateBuffer(&readCentroidsDesc);

    // This is the actual KMeans loop
    std::cout << "start iterations" << std::endl;
    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
    for (int32_t iter{0}; iter < max_iter; ++iter) {

        wgpu::ComputePassEncoder pass1 = encoder.BeginComputePass();
        pass1.SetPipeline(pipeline1);
        pass1.SetBindGroup(0, bindGroup1);
        pass1.DispatchWorkgroups(wgX, wgY);
        pass1.End();

        wgpu::ComputePassEncoder pass2 = encoder.BeginComputePass();
        pass2.SetPipeline(pipeline2);
        pass2.SetBindGroup(0, bindGroup2);
        pass2.DispatchWorkgroups((k + 255) / 256, 1);
        pass2.End();

    }
    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);

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
        wgpu::MapMode::Read, 0, readLabelsDesc.size, wgpu::CallbackMode::AllowProcessEvents,
        [&](wgpu::MapAsyncStatus status, wgpu::StringView msg) {
            if (status == wgpu::MapAsyncStatus::Success) {
                const uint8_t* mappedData = (const uint8_t*)readLabelsBuffer.GetConstMappedRange();
                // ... Copy data to your C++ vector ...
                // Copy row by row to remove padding and put data into 'result'
                std::cout << "mapping labels" << std::endl;
                for (size_t y = 0; y < height; ++y) {
                    const uint8_t* rowPtr = mappedData + (y * bytesPerRowLabels);
                    for (size_t x = 0; x < width; ++x) {
                        const uint8_t* pixelPtr = rowPtr + (x * bytesPerPixel);
                        uint32_t r = *(const uint32_t*)pixelPtr;

                        size_t dstIndex = y * width + x;
                        labels[dstIndex] = static_cast<int32_t>(r);
                    }
                }
                readLabelsBuffer.Unmap();
            }
        });

    // Map Centroids
    readCentroidsBuffer.MapAsync(
        wgpu::MapMode::Read, 0, readCentroidsDesc.size, wgpu::CallbackMode::AllowProcessEvents,
        [&](wgpu::MapAsyncStatus status, wgpu::StringView msg) {
            if (status == wgpu::MapAsyncStatus::Success) {
                const float* mappedData = (const float*)readCentroidsBuffer.GetConstMappedRange();
                // ... Copy data to your C++ vector ...
                std::cout << "mapping centroids" << std::endl;
                for (int i = 0; i < k; i++) {
                    // if CIELAB color space these represent l, a, b, alpha
                    float r = *(mappedData);
                    float g = *(mappedData + 1);
                    float b = *(mappedData + 2);
                    float a = *(mappedData + 3);
                    switch (color_space) {
                        case COLOR_SPACE_OPTION_RGB: {
                            centroids[i] = ImageLib::RGBAPixel<float>(r * 255.f, g * 255.f,
                                                                      b * 255.f, a * 255.f);
                            break;
                        }
                        case COLOR_SPACE_OPTION_CIELAB: {
                            centroids_lab[i] = ImageLib::LABAPixel<float>(r * 255.f, g * 255.f,
                                                                          b * 255.f, a * 255.f);
                            break;
                        }
                    }
                }
                readCentroidsBuffer.Unmap();
                done = true;  // Signal completion
            }
        });

    while (!done) {
        GPU::getClassInstance().get_instance().ProcessEvents();
#if defined(__EMSCRIPTEN__)
        emscripten_sleep(10);
#endif
    }

    // Write the final centroid values to each pixel in the cluster
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int32_t i{0}; i < k; ++i) {
            lab_to_rgb<float, float>(centroids_lab[i], centroids[i]);
        }
    }

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
