@group(0) @binding(0) var inputTex : texture_2d<f32>;
@group(0) @binding(1) var centroids: texture_storage_2d<rgba32float, read>;
@group(0) @binding(2) var clusters: texture_storage_2d<rgba32uint, write>;

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

@group(0) @binding(3) var<uniform> params : Params;
@group(0) @binding(4) var<storage, read_write> accumulators: array<ClusterAccumulator>;

// --- WORKGROUP SHARED MEMORY ---
// Must have a fixed compile-time size. Set this to your maximum expected K (e.g., 32 or 64).
const MAX_K: u32 = 64u; 
var<workgroup> local_sumR: array<atomic<i32>, MAX_K>;
var<workgroup> local_sumG: array<atomic<i32>, MAX_K>;
var<workgroup> local_sumB: array<atomic<i32>, MAX_K>;
var<workgroup> local_count: array<atomic<u32>, MAX_K>;

@compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32 // A flat ID from 0 to 255 for this block
) {
    let dims = textureDimensions(inputTex);
    let x = global_id.x;
    let y = global_id.y;

    let is_valid = x < dims.x && y < dims.y;

    // 1. INITIALIZE LOCAL MEMORY
    // We let the first K threads in the block zero out the shared memory
    if (local_idx < params.numCentroids) {
        atomicStore(&local_sumR[local_idx], 0i);
        atomicStore(&local_sumG[local_idx], 0i);
        atomicStore(&local_sumB[local_idx], 0i);
        atomicStore(&local_count[local_idx], 0u);
    }

    // Wait for all 256 threads to reach this point (ensures memory is zeroed)
    workgroupBarrier();

    if (is_valid) {
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
        // 3. ATOMIC ADD TO *LOCAL* MEMORY (Extremely fast, no global lock)
        atomicAdd(&local_sumR[bestClusterIndex], i32(centerVal.r * 1000.0));
        atomicAdd(&local_sumG[bestClusterIndex], i32(centerVal.g * 1000.0));
        atomicAdd(&local_sumB[bestClusterIndex], i32(centerVal.b * 1000.0));
        atomicAdd(&local_count[bestClusterIndex], 1u);
    }

    // 4. WAIT FOR ALL THREADS TO FINISH THEIR MATH
    workgroupBarrier();
    
    // 5. FLUSH LOCAL TO GLOBAL
    // Now, the first K threads take the block's total and add it to the global buffer.
    if (local_idx < params.numCentroids) {
        // We only hit the global atomics ONCE per workgroup per centroid!
        let r_sum = atomicLoad(&local_sumR[local_idx]);
        let g_sum = atomicLoad(&local_sumG[local_idx]);
        let b_sum = atomicLoad(&local_sumB[local_idx]);
        let c_sum = atomicLoad(&local_count[local_idx]);

        // Only add if this block actually found pixels for this cluster
        if (c_sum > 0u) {
            atomicAdd(&accumulators[local_idx].sumR, r_sum);
            atomicAdd(&accumulators[local_idx].sumG, g_sum);
            atomicAdd(&accumulators[local_idx].sumB, b_sum);
            atomicAdd(&accumulators[local_idx].count, c_sum);
        }
    }
}