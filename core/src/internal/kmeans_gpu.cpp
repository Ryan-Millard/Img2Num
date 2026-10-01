
#include "internal/kmeans_gpu.h"

#include "img2num.h"
#include "internal/cielab.h"
#include "internal/gpu.h"
#include "internal/gpu_utils.h"
#include "internal/Image.h"
#include "internal/LABAPixel.h"
#include "internal/log.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"

#include <algorithm>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <limits>
#include <random>
#include <type_traits>
#include <vector>

// Packed struct definitions matching WGSL std140 layout — unchanged from original
#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
struct Params {
    uint32_t numPoints;
    uint32_t numCentroids;
    uint32_t pad[2];
}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
struct ClusterAccumulator {
    int32_t sumR;
    int32_t sumG;
    int32_t sumB;
    uint32_t count;
}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
struct CentroidParams {
    float r, g, b, a;
    uint32_t width;
    uint32_t pad[3]; // Padding to align to 16 bytes
}
#ifndef _MSC_VER
__attribute__((packed))
#endif
;
#ifdef _MSC_VER
#pragma pack(pop)
#endif

// K-Means++ GPU initialization
template <typename PixelT>
void kMeansPlusPlusInitGpu(
    const ImageLib::Image<PixelT>& pixels, ImageLib::Image<PixelT>& out_centroids, int k,
    const uint8_t color_space
) {
    if (k <= 0)
        return;

    size_t width = pixels.getWidth();
    size_t height = pixels.getHeight();
    size_t num_pixels = width * height;
    uint32_t w = static_cast<uint32_t>(width);
    uint32_t h = static_cast<uint32_t>(height);

    std::vector<PixelT> centroids;

    // 1. Upload image as RGBA32Float texture
    gpu::Texture inputTexture(
        w, h, wgpu::TextureFormat::RGBA32Float,
        wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst
    );

    std::vector<float> gpu_pixels;
    gpu_pixels.reserve(num_pixels * 4);
    for (size_t i = 0; i < num_pixels; i++) {
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
    inputTexture.write(gpu_pixels.data(), gpu_pixels.size() * sizeof(float), 16);

    // 2. MinDist buffer (initialized to FLT_MAX so first centroid overwrites everything)
    std::vector<float> initial_dists(num_pixels, std::numeric_limits<float>::max());
    gpu::Buffer<float> minDistBuffer(
        num_pixels,
        wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopySrc | wgpu::BufferUsage::CopyDst
    );
    minDistBuffer.write(initial_dists);

    // 3. Uniform buffer for passing new centroid color
    gpu::Buffer<CentroidParams> paramBuffer(
        1, wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst
    );

    // 4. Pipeline and bind group
    wgpu::ComputePipeline pipeline =
        gpu::cached_pipeline("dist_shader", "updateDistShader");

    wgpu::BindGroup bindGroup = gpu::make_bind_group(
        pipeline, 0,
        {
            gpu::BindEntry::texture(0, inputTexture),
            gpu::BindEntry::buffer_entry(1, minDistBuffer),
            gpu::BindEntry::buffer_entry(2, paramBuffer),
        }
    );

    // RNG Setup
    std::random_device rd;
    std::mt19937 gen(rd());

    // Step 1: Choose the first centroid randomly
    std::uniform_int_distribution<> dis(0, num_pixels - 1);
    int first_index = dis(gen);
    centroids.push_back(pixels[first_index]);

    // Step 2 & 3: Iteratively select remaining centroids
    for (int i = 1; i < k; ++i) {
        // A. Upload current centroid to GPU
        PixelT c = centroids.back();
        CentroidParams params;
        if constexpr (std::is_same_v<PixelT, ImageLib::LABAPixel<float>>) {
            params = CentroidParams {
                c.l / 255.0f, c.a / 255.0f, c.b / 255.0f, 1.0f, static_cast<uint32_t>(width)
            };
        } else {
            params = CentroidParams {
                c.red / 255.0f, c.green / 255.0f, c.blue / 255.0f, 1.0f,
                static_cast<uint32_t>(width)
            };
        }
        paramBuffer.write(&params, 1);

        // B. Dispatch shader (updates min_dist buffer on GPU)
        gpu::dispatch(pipeline, bindGroup, gpu::workgroup_count(w), gpu::workgroup_count(h));

        // C. Read distances back to CPU
        std::vector<float> dists = minDistBuffer.read();

        // D. CPU-side roulette wheel selection
        double sum_dist_sq = 0.0;
        for (size_t j = 0; j < num_pixels; ++j) {
            sum_dist_sq += dists[j];
        }

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

        if (selected_index == -1)
            selected_index = num_pixels - 1;

        centroids.push_back(pixels[selected_index]);

#if defined(__EMSCRIPTEN__)
        emscripten_sleep(10);
#endif
    }

    std::copy(centroids.begin(), centroids.end(), out_centroids.begin());

#if defined(__EMSCRIPTEN__)
    emscripten_sleep(50);
#endif
    // All textures/buffers destroyed automatically by RAII
}

void kmeans_gpu(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const int32_t max_iter, const uint8_t color_space
) {
    ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
    pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
    const int32_t num_pixels {pixels.getSize()};

    ImageLib::Image<ImageLib::RGBAPixel<float>> centroids {k, 1};
    ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab {k, 1};
    std::vector<int32_t> labels(num_pixels, -1);

    ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(), pixels.getHeight());

    if (color_space == gpu::COLOR_SPACE_CIELAB) {
        for (int i {0}; i < pixels.getSize(); ++i) {
            rgb_to_lab<float, float>(pixels[i], lab[i]);
        }
    }

    IMG2NUM_LOG_INFO("starting");

    // Step 2: Initialize centroids via K-Means++
    switch (color_space) {
    case gpu::COLOR_SPACE_RGB:
        kMeansPlusPlusInitGpu<ImageLib::RGBAPixel<float>>(pixels, centroids, k, color_space);
        break;
    case gpu::COLOR_SPACE_CIELAB:
        kMeansPlusPlusInitGpu<ImageLib::LABAPixel<float>>(lab, centroids_lab, k, color_space);
        break;
    }

    IMG2NUM_LOG_INFO("kmeans++ init done");

    // =========================================================================
    // GPU resource setup (previously in setup() function)
    // =========================================================================
    const uint32_t w = static_cast<uint32_t>(width);
    const uint32_t h = static_cast<uint32_t>(height);
    constexpr uint32_t bpp = 16; // RGBA32Float = 16 bytes per pixel

    // Input texture
    gpu::Texture inputTexture(
        w, h, wgpu::TextureFormat::RGBA32Float,
        wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::CopyDst
    );

    std::vector<float> pixels_;
    pixels_.reserve(num_pixels * 4);
    for (int i = 0; i < num_pixels; i++) {
        switch (color_space) {
        case gpu::COLOR_SPACE_RGB: {
            auto p = pixels[i];
            pixels_.push_back(p.red / 255.0f);
            pixels_.push_back(p.green / 255.0f);
            pixels_.push_back(p.blue / 255.0f);
            pixels_.push_back(p.alpha / 255.0f);
            break;
        }
        case gpu::COLOR_SPACE_CIELAB: {
            auto p = lab[i];
            pixels_.push_back(p.l / 255.0f);
            pixels_.push_back(p.a / 255.0f);
            pixels_.push_back(p.b / 255.0f);
            pixels_.push_back(p.alpha / 255.0f);
            break;
        }
        }
    }
    inputTexture.write(pixels_.data(), pixels_.size() * sizeof(float), bpp);

    // Centroid texture (k x 1)
    gpu::Texture centroidTexture(
        static_cast<uint32_t>(k), 1, wgpu::TextureFormat::RGBA32Float,
        wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding |
            wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc
    );

    std::vector<float> centroids_;
    centroids_.reserve(k * 4);
    switch (color_space) {
    case gpu::COLOR_SPACE_RGB:
        for (int i = 0; i < k; i++) {
            auto p = centroids[i];
            centroids_.push_back(p.red / 255.0f);
            centroids_.push_back(p.green / 255.0f);
            centroids_.push_back(p.blue / 255.0f);
            centroids_.push_back(p.alpha / 255.0f);
        }
        break;
    case gpu::COLOR_SPACE_CIELAB:
        for (int i = 0; i < k; i++) {
            auto p = centroids_lab[i];
            centroids_.push_back(p.l / 255.0f);
            centroids_.push_back(p.a / 255.0f);
            centroids_.push_back(p.b / 255.0f);
            centroids_.push_back(p.alpha / 255.0f);
        }
        break;
    }
    centroidTexture.write(centroids_.data(), centroids_.size() * sizeof(float), bpp);

    // Label texture
    gpu::Texture labelTexture(
        w, h, wgpu::TextureFormat::RGBA32Uint,
        wgpu::TextureUsage::TextureBinding | wgpu::TextureUsage::StorageBinding |
            wgpu::TextureUsage::CopyDst | wgpu::TextureUsage::CopySrc
    );

    // Params uniform buffer
    gpu::Buffer<Params> paramBuffer(1, wgpu::BufferUsage::Uniform | wgpu::BufferUsage::CopyDst);
    Params params = {static_cast<uint32_t>(num_pixels), static_cast<uint32_t>(k)};
    paramBuffer.write(&params, 1);

    // Cluster accumulator storage buffer
    std::vector<ClusterAccumulator> reset_centroids(k, {0, 0, 0, 0});
    gpu::Buffer<ClusterAccumulator> accBuffer(
        k, wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopyDst
    );
    accBuffer.write(reset_centroids);

    // Pipelines
    wgpu::ComputePipeline pipeline1 =
        gpu::cached_pipeline("assign_update_shader", "assignUpdateShader");
    wgpu::ComputePipeline pipeline2 =
        gpu::cached_pipeline("resolve_shader", "resolveShader");

    // Bind groups
    wgpu::BindGroup bindGroup1 = gpu::make_bind_group(
        pipeline1, 0,
        {
            gpu::BindEntry::texture(0, inputTexture),
            gpu::BindEntry::texture(1, centroidTexture),
            gpu::BindEntry::texture(2, labelTexture),
            gpu::BindEntry::buffer_entry(3, paramBuffer),
            gpu::BindEntry::buffer_entry(4, accBuffer),
        }
    );

    wgpu::BindGroup bindGroup2 = gpu::make_bind_group(
        pipeline2, 0,
        {
            gpu::BindEntry::buffer_entry(0, accBuffer),
            gpu::BindEntry::texture(1, centroidTexture),
        }
    );

    // =========================================================================
    // Main K-Means loop — all iterations batched into one submission
    // =========================================================================
    IMG2NUM_LOG_INFO("start iterations");
    uint32_t wgX = gpu::workgroup_count(w);
    uint32_t wgY = gpu::workgroup_count(h);

    wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
    for (int32_t iter {0}; iter < max_iter; ++iter) {
        gpu::encode_pass(encoder, pipeline1, bindGroup1, wgX, wgY);
        gpu::encode_pass(encoder, pipeline2, bindGroup2, gpu::workgroup_count(k, 256));
    }
    wgpu::CommandBuffer commands = encoder.Finish();
    GPU::getClassInstance().get_queue().Submit(1, &commands);
    IMG2NUM_LOG_INFO("done iterations");

    // =========================================================================
    // Readback — alignment stripping handled automatically
    // =========================================================================

    // Read labels (RGBA32Uint, 16 bytes/pixel — extract R channel as label)
    IMG2NUM_LOG_INFO("read out");
    std::vector<uint8_t> labelData = labelTexture.read(bpp);

    IMG2NUM_LOG_INFO("mapping labels");
    for (int32_t i = 0; i < num_pixels; ++i) {
        uint32_t r = 0;
        std::memcpy(&r, &labelData[i * bpp], sizeof(uint32_t));
        labels[i] = static_cast<int32_t>(r);
    }

    // Read centroids (RGBA32Float, k x 1 texture)
    std::vector<uint8_t> centroidData = centroidTexture.read(bpp);
    const float* centroidFloats = reinterpret_cast<const float*>(centroidData.data());

    IMG2NUM_LOG_INFO("mapping centroids");
    for (int i = 0; i < k; i++) {
        float cr = centroidFloats[i * 4];
        float cg = centroidFloats[i * 4 + 1];
        float cb = centroidFloats[i * 4 + 2];
        float ca = centroidFloats[i * 4 + 3];
        switch (color_space) {
        case gpu::COLOR_SPACE_RGB:
            centroids[i] =
                ImageLib::RGBAPixel<float>(cr * 255.f, cg * 255.f, cb * 255.f, ca * 255.f);
            break;
        case gpu::COLOR_SPACE_CIELAB:
            centroids_lab[i] =
                ImageLib::LABAPixel<float>(cr * 255.f, cg * 255.f, cb * 255.f, ca * 255.f);
            break;
        }
    }

    // =========================================================================
    // Post-processing — LAB→RGB conversion and output
    // =========================================================================
    if (color_space == gpu::COLOR_SPACE_CIELAB) {
        for (int32_t i {0}; i < k; ++i) {
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
    IMG2NUM_LOG_INFO("copying labels out");
    std::memcpy(out_labels, labels.data(), labels.size() * sizeof(int32_t));

#if defined(__EMSCRIPTEN__)
    emscripten_sleep(50);
#endif
    // All textures, buffers destroyed automatically by RAII destructors
}
