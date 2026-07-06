#include "img2num.h"
#include "internal/cielab.h"
#include "internal/gpu.h"
#include "internal/Image.h"
#include "internal/LABAPixel.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <functional>
#include <limits>
#include <map>
#include <numeric>
#include <random>
#include <vector>

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB {0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB {1};

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

template <typename PixelT>
void dist_gpu(
    const ImageLib::Image<PixelT>& pixels, ImageLib::Image<PixelT>& centroids,
    std::vector<std::vector<float>>& dists
) {
    size_t width = pixels.getWidth();
    size_t height = pixels.getHeight();
    size_t num_pixels = width * height;

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
        &texDst, gpu_pixels.data(), gpu_pixels.size() * 4, &texLayout, &texDesc.size
    );

    // 2. Create MinDist Buffer (Storage)
    // Initialize with FLT_MAX so the first centroid overwrites everything
    std::vector<float> initial_dists(num_pixels, std::numeric_limits<float>::max());

    wgpu::BufferDescriptor distDesc = {};
    distDesc.size = num_pixels * sizeof(float);
    distDesc.usage =
        wgpu::BufferUsage::Storage | wgpu::BufferUsage::CopySrc | wgpu::BufferUsage::CopyDst;
    wgpu::Buffer minDistBuffer = GPU::getClassInstance().get_device().CreateBuffer(&distDesc);
    GPU::getClassInstance().get_queue().WriteBuffer(
        minDistBuffer, 0, initial_dists.data(), distDesc.size
    );

    // 3. Create Uniform Buffer (For passing new centroid color)

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

    bool* done = new bool(false);
    for (int i = 0; i < centroids.getSize(); ++i) {
        *done = false;
        PixelT c = centroids[i];
        CentroidParams params;
        if constexpr (std::is_same_v<PixelT, ImageLib::LABAPixel<float>>) {
            params = CentroidParams {
                c.l / 255.0f, c.a / 255.0f, c.b / 255.0f, 1.0f, static_cast<uint32_t>(width)};
        } else {
            params = CentroidParams {
                c.red / 255.0f, c.green / 255.0f, c.blue / 255.0f, 1.0f,
                static_cast<uint32_t>(width)};
        }

        GPU::getClassInstance().get_queue().WriteBuffer(
            paramBuffer, 0, &params, sizeof(CentroidParams)
        );

        // B. Dispatch Shader (Updates min_dist buffer on GPU)
        wgpu::CommandEncoder encoder = GPU::getClassInstance().get_device().CreateCommandEncoder();
        wgpu::ComputePassEncoder pass = encoder.BeginComputePass();
        pass.SetPipeline(pipeline);
        pass.SetBindGroup(0, bindGroup);
        pass.DispatchWorkgroups((width + 15) / 16, (height + 15) / 16, 1);
        pass.End();

        // C. Copy Result to ReadBuffer
        encoder.CopyBufferToBuffer(minDistBuffer, 0, readBuffer, 0, readDesc.size);
        wgpu::CommandBuffer commands = encoder.Finish();
        GPU::getClassInstance().get_queue().Submit(1, &commands);

        // D. Map and Read

        readBuffer.MapAsync(
            wgpu::MapMode::Read, 0, readDesc.size, wgpu::CallbackMode::AllowProcessEvents,
            [](wgpu::MapAsyncStatus status, wgpu::StringView msg, void* userdata) {
                bool* flag = static_cast<bool*>(userdata);
                bool success = false;
                if (status == wgpu::MapAsyncStatus::Success) {
                    // std::cout << "Map success: " << msg.data << std::endl;
                    success = true;
                } else {
                    // Handle error
                    // std::cerr << "Map failed: " << msg.data << std::endl;
                    success = false;
                }
                *flag = true;
            },
            (void*)done
        );

        // E. Wait for GPU
        while (!*done) {
            GPU::getClassInstance().get_instance().ProcessEvents();
#if defined(__EMSCRIPTEN__)
            emscripten_sleep(10);
#endif
        }

        const float* dist = (const float*)readBuffer.GetConstMappedRange();
        std::memcpy(dists[i].data(), dist, num_pixels * sizeof(float));

        readBuffer.Unmap();
#if defined(__EMSCRIPTEN__)
        emscripten_sleep(10);
#endif
    }

    // explicit clean up
    if (inputTexture)
        inputTexture.Destroy();
    readBuffer.Destroy();
    minDistBuffer.Destroy();
    paramBuffer.Destroy();
    delete done;

#if defined(__EMSCRIPTEN__)
    emscripten_sleep(50);
#endif
}

template <typename PixelT>
void frequency_histogram(
    const ImageLib::Image<PixelT>& pixels, ImageLib::Image<PixelT>& out_centroids, int k,
    float coverage
) {
    const int32_t num_pixels {pixels.getSize()};
    std::vector<PixelT> centroids;
    std::map<PixelT, int> colorHistogram;

    for (int i {0}; i < num_pixels; ++i) {
        // if color exists increment counter, else add to map and initialize with 1
        if (colorHistogram.find(pixels[i]) != colorHistogram.end()) {
            colorHistogram[pixels[i]] += 1;
        } else {
            colorHistogram[pixels[i]] = 1;
        }
    }

    std::vector<std::pair<PixelT, int>> vec(colorHistogram.begin(), colorHistogram.end());
    if (k > 0) {
        std::nth_element(vec.begin(), vec.begin() + k, vec.end(), [](const auto& a, const auto& b) {
            return a.second > b.second; // Sort descending by value
        });

        for (int i = 0; i < k; ++i) {
            centroids.push_back(vec[i].first);
        }
    } else {
        // select colors that cover at least 90% of image area
        std::sort(vec.begin(), vec.end(), [](const auto& a, const auto& b) {
            return a.second > b.second; // Sort descending by value
        });
        int cum_pixels {0};
        for (int i = 0; i < vec.size(); ++i) {
            cum_pixels += vec[i].second;
            centroids.push_back(vec[i].first);
            if (float(cum_pixels) >= coverage * float(num_pixels)) {
                break;
            }
        }
        out_centroids.resize(centroids.size(), 1, PixelT());
    }
    std::copy(centroids.begin(), centroids.end(), out_centroids.begin());
}

void dominant_colors(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const float coverage, const uint8_t color_space
) {
    ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
    pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
    const int32_t num_pixels {pixels.getSize()};

    ImageLib::Image<ImageLib::RGBAPixel<float>> centroids {k, 1};
    ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab {k, 1};
    std::vector<int32_t> labels(num_pixels, 0);

    // may need to wipe alpha values which can mess with dominant colors
    for (int x {0}; x < width; ++x){
        for (int y {0}; y < height; ++ y){
            auto p = pixels.getPixel(x, y);
            p.alpha = 255.0f;
            pixels.setPixel(x, y, p);
        }
    }

    ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(), pixels.getHeight());
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int i {0}; i < pixels.getSize(); ++i) {
            rgb_to_lab<float, float>(pixels[i], lab[i]);
        }
    }

    // make sure coverage is (0.0f, 1.0f)
    float cov = std::clamp(coverage, 0.0f, 1.0f);

    int32_t _k {k};
    switch (color_space) {
    case COLOR_SPACE_OPTION_RGB: {
        frequency_histogram<ImageLib::RGBAPixel<float>>(pixels, centroids, k, cov);
        if (k == 0) {
            _k = centroids.getSize();
            centroids_lab.resize(_k, 1, ImageLib::LABAPixel<float>());
        }
        break;
    }
    case COLOR_SPACE_OPTION_CIELAB: {
        frequency_histogram<ImageLib::LABAPixel<float>>(lab, centroids_lab, k, cov);
        if (k == 0) {
            _k = centroids_lab.getSize();
            centroids.resize(_k, 1, ImageLib::RGBAPixel<float>());
        }
        break;
    }
    }

    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int32_t i {0}; i < _k; ++i) {
            lab_to_rgb<float, float>(centroids_lab[i], centroids[i]);
        }
    }

    if (GPU::getClassInstance().is_initialized()) {
        std::vector<std::vector<float>> dists {static_cast<size_t>(_k)};
        for (int j = 0; j < _k; ++j) {
            dists[j] = std::vector<float>(num_pixels, 0.0f);
        }
        switch (color_space) {
        case COLOR_SPACE_OPTION_RGB: {
            dist_gpu<ImageLib::RGBAPixel<float>>(pixels, centroids, dists);
            break;
        }
        case COLOR_SPACE_OPTION_CIELAB: {
            dist_gpu<ImageLib::LABAPixel<float>>(lab, centroids_lab, dists);
            break;
        }
        }
        for (int32_t i {0}; i < num_pixels; ++i) {
            float min_color_dist {std::numeric_limits<float>::max()};
            int32_t best_cluster {0};
            for (int32_t j {0}; j < _k; ++j) {
                float dist = dists[j][i];
                if (dist < min_color_dist) {
                    min_color_dist = dist;
                    best_cluster = j;
                }
            }
            labels[i] = best_cluster;
            out_data[i * 4 + 0] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].red, 0.0f, 255.0f));
            out_data[i * 4 + 1] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].green, 0.0f, 255.0f));
            out_data[i * 4 + 2] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].blue, 0.0f, 255.0f));
            out_data[i * 4 + 3] = 255;
        }

    } else {
        // Iterate over pixels - cpu bound
        for (int32_t i {0}; i < num_pixels; ++i) {
            float min_color_dist {std::numeric_limits<float>::max()};
            int32_t best_cluster {0};

            // Iterate over centroids to find centroid with most similar color to
            // pixels[i]
            float dist;
            for (int32_t j {0}; j < _k; ++j) {
                switch (color_space) {
                case COLOR_SPACE_OPTION_RGB: {
                    dist = ImageLib::RGBAPixel<float>::colorDistance(pixels[i], centroids[j]);
                    break;
                }
                case COLOR_SPACE_OPTION_CIELAB: {
                    dist = ImageLib::LABAPixel<float>::colorDistance(lab[i], centroids_lab[j]);
                    break;
                }
                }
                if (dist < min_color_dist) {
                    min_color_dist = dist;
                    best_cluster = j;
                }
            }

            labels[i] = best_cluster;
            out_data[i * 4 + 0] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].red, 0.0f, 255.0f));
            out_data[i * 4 + 1] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].green, 0.0f, 255.0f));
            out_data[i * 4 + 2] =
                static_cast<uint8_t>(std::clamp(centroids[best_cluster].blue, 0.0f, 255.0f));
            out_data[i * 4 + 3] = 255;
        }
    }

    // Write labels to out_labels
    std::memcpy(out_labels, labels.data(), labels.size() * sizeof(int32_t));
}

namespace img2num {
void color_quantize(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const float coverage, const uint8_t color_space
) {
    GPU::getClassInstance().init_gpu();

    dominant_colors(data, out_data, out_labels, width, height, k, coverage, color_space);
}
} // namespace img2num