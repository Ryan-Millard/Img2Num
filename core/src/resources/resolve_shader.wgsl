struct ClusterAccumulator {
    sumR: i32,
    sumG: i32,
    sumB: i32,
    count: u32
};

@group(0) @binding(0) var<storage, read> accumulators: array<ClusterAccumulator>;
@group(0) @binding(1) var centroids : texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(256)
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