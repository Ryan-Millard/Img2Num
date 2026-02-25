#ifndef KMEANS_GPU_H
#define KMEANS_GPU_H

#include <cstddef> // for size_t
#include <cstdint> // for uint8_t
#include "internal/gpu.h"

/*extern bool gpu_initialized;
extern bool adapter_ready;
extern bool device_ready;*/

// needs atomicAdd but that only supports i32

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

constexpr int scale = 1000;

inline const char* resolveShader = R"(
struct ClusterAccumulator {
    sumR: i32,
    sumG: i32,
    sumB: i32,
    count: u32
};

@group(0) @binding(0) var<storage, read> accumulators: array<ClusterAccumulator>;
@group(0) @binding(1) var centroids : texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let i = global_id.x;
    if (i >= arrayLength(&accumulators)) { return; }

    let acc = accumulators[i];
    
    // Avoid division by zero for empty clusters
    if (acc.count > 0u) {
        let r = (f32(acc.sumR) / 1000.0) / f32(acc.count);
        let g = (f32(acc.sumG) / 1000.0) / f32(acc.count);
        let b = (f32(acc.sumB) / 1000.0) / f32(acc.count);
        
        // Write new centroid position
        // Assuming Alpha is 1.0
        textureStore(centroids, vec2<i32>(i32(i), 0), vec4<f32>(r, g, b, 1.0));
    }
}
)";

inline const char* updateShader = R"(
@group(0) @binding(0) var inputTex : texture_2d<f32>;
@group(0) @binding(1) var clusters: texture_storage_2d<rgba32uint, read>;

struct Params {
    numPoints : u32,
    numCentroids : u32,
};

struct ClusterAccumulator {
    sumR: atomic<i32>, // Atomic Integer R
    sumG: atomic<i32>, // Atomic Integer G
    sumB: atomic<i32>, // Atomic Integer B
    count: atomic<u32> // Atomic Counter
};

@group(0) @binding(2) var<storage, read_write> accumulators: array<ClusterAccumulator>;
@group(0) @binding(3) var<uniform> params : Params;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let dims = textureDimensions(inputTex);
    let x = global_id.x;
    let y = global_id.y;

    if (x >= dims.x || y >= dims.y) {
        return;
    }

    let centerVal = textureLoad(inputTex, vec2<i32>(i32(x), i32(y)), 0);
    let clusterIdx = textureLoad(clusters, vec2<i32>(i32(x), i32(y))).r;

    if (clusterIdx < params.numCentroids) {
        atomicAdd(&accumulators[clusterIdx].sumR, i32(centerVal.r * 1000.0));
        atomicAdd(&accumulators[clusterIdx].sumG, i32(centerVal.g * 1000.0));
        atomicAdd(&accumulators[clusterIdx].sumB, i32(centerVal.b * 1000.0));
        atomicAdd(&accumulators[clusterIdx].count, 1u);
    }
}
)";

inline const char* assignShader = R"(
@group(0) @binding(0) var inputTex : texture_2d<f32>;
@group(0) @binding(1) var centroids: texture_storage_2d<rgba32float, read>;
@group(0) @binding(2) var clusters: texture_storage_2d<rgba32uint, write>;

struct Params {
    numPoints : u32,
    numCentroids : u32,
};
@group(0) @binding(3) var<uniform> params : Params;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let dims = textureDimensions(inputTex);
    let x = global_id.x;
    let y = global_id.y;

    if (x >= dims.x || y >= dims.y) {
        return;
    }

    let centerVal = textureLoad(inputTex, vec2<i32>(i32(x), i32(y)), 0);

    var minDistSq = 1e+38; // Max f32
    var bestClusterIndex: u32 = 0u;

    for (var i = 0u; i < params.numCentroids; i = i + 1u) {        
        // Euclidean distance squared (avoids expensive sqrt)
        let c = textureLoad(centroids, vec2<i32>(i32(i), 0));
        let diff = centerVal.rgb - c.rgb;
        let distSq = dot(diff, diff);

        if (distSq < minDistSq) {
            minDistSq = distSq;
            bestClusterIndex = i;
        }
    }

    textureStore(clusters, vec2<i32>(i32(x), i32(y)), vec4<u32>(bestClusterIndex, 0u, 0u, 0u));
}
)";

inline const char* updateDistShader = R"(
@group(0) @binding(0) var inputTex : texture_2d<f32>;
// We use a buffer instead of a texture for distances.
// It matches the std::vector<double> min_dist_sq structure perfectly.
@group(0) @binding(1) var<storage, read_write> minDistances : array<f32>;

struct Params {
    r: f32, g: f32, b: f32, a: f32,
    width: u32,
};
@group(0) @binding(2) var<uniform> params : Params;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let index = global_id.x;
    let width = params.width;
    
    // Map 1D Global ID to 2D Texture Coordinates
    let y = index / width;
    let x = index % width;
    
    let dims = textureDimensions(inputTex);
    if (x >= dims.x || y >= dims.y) { return; }

    // 1. Load Pixel
    let currentVal = textureLoad(inputTex, vec2<i32>(i32(x), i32(y)), 0);
    
    // 2. Calculate Squared Euclidean Distance to the NEW centroid (passed in params)
    // Note: Assuming texture is 0.0-1.0. If you need 0-255, multiply diff by 255.0.
    let dr = currentVal.r - params.r;
    let dg = currentVal.g - params.g;
    let db = currentVal.b - params.b;
    
    let distSq = dr*dr + dg*dg + db*db;
    
    // 3. Update the Running Minimum
    // We strictly reduce the value. K-Means++ wants min(d(x, c1), d(x, c2)...)
    let oldMin = minDistances[index];
    if (distSq < oldMin) {
        minDistances[index] = distSq;
    }
}
)";

void kmeans_gpu(const uint8_t *data, uint8_t *out_data,
                     int32_t *out_labels, const int32_t width,
                     const int32_t height, const int32_t k,
                     const int32_t max_iter, const uint8_t color_space);

#endif