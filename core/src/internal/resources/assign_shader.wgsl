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