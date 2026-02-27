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