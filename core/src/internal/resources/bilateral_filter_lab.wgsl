@group(0) @binding(0) var inputTex : texture_2d<f32>;
@group(0) @binding(1) var outputTex : texture_storage_2d<rgba32float, write>;

struct Params {
    sigmaSpatial : f32,
    sigmaRange : f32,
};
@group(0) @binding(2) var<uniform> params : Params;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let dims = textureDimensions(inputTex);
    let x = global_id.x;
    let y = global_id.y;

    if (x >= dims.x || y >= dims.y) {
        return;
    }

    let centerVal = textureLoad(inputTex, vec2<i32>(i32(x), i32(y)), 0);
    var numerator = vec4<f32>(0.0);
    var denominator = 0.0;
    
    // Kernel radius
    let radius = i32(3.0 * params.sigmaSpatial); 

    for (var i = -radius; i <= radius; i++) {
        for (var j = -radius; j <= radius; j++) {
            let nx = i32(x) + i;
            let ny = i32(y) + j;

            if (nx >= 0 && ny >= 0 && nx < i32(dims.x) && ny < i32(dims.y)) {
                let neighborVal = textureLoad(inputTex, vec2<i32>(nx, ny), 0);
                
                // Spatial weight
                let distSq = f32(i*i + j*j);
                let wS = exp(-distSq / (2.0 * params.sigmaSpatial * params.sigmaSpatial));

                // Range weight (using RGB distance)
                let diff = centerVal.rgb - neighborVal.rgb;
                let rangeSq = dot(diff, diff);
                let wR = exp(-rangeSq / (2.0 * params.sigmaRange * params.sigmaRange));

                let w = wS * wR;
                numerator += neighborVal * w;
                denominator += w;
            }
        }
    }

    textureStore(outputTex, vec2<i32>(i32(x), i32(y)), numerator / denominator);
}