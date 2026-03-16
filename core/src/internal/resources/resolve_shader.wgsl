struct ClusterAccumulator {
    sumR: atomic<i32>,
    sumG: atomic<i32>,
    sumB: atomic<i32>,
    count: atomic<u32>
};

@group(0) @binding(0) var<storage, read_write> accumulators: array<ClusterAccumulator>;
@group(0) @binding(1) var centroids : texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let i = global_id.x;
    if (i >= arrayLength(&accumulators)) { return; }

    // 1. Load the count ONCE
    let count = atomicLoad(&accumulators[i].count);
    
    // Avoid division by zero for empty clusters
    if (count > 0u) {
        let fCount = f32(count);
        
        // 2. Load the sums ONCE
        let sumR = atomicLoad(&accumulators[i].sumR);
        let sumG = atomicLoad(&accumulators[i].sumG);
        let sumB = atomicLoad(&accumulators[i].sumB);

        // 3. Do the math
        let r = (f32(sumR) / 1000.0) / fCount;
        let g = (f32(sumG) / 1000.0) / fCount;
        let b = (f32(sumB) / 1000.0) / fCount;
        
        textureStore(centroids, vec2<i32>(i32(i), 0), vec4<f32>(r, g, b, 1.0));
    }

    // 4. Reset for the NEXT iteration
    atomicStore(&accumulators[i].sumR, 0i);
    atomicStore(&accumulators[i].sumG, 0i);
    atomicStore(&accumulators[i].sumB, 0i);
    atomicStore(&accumulators[i].count, 0u);
}