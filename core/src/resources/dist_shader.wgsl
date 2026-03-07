@group(0) @binding(0) var inputTex : texture_2d<f32>;
// We use a buffer instead of a texture for distances.
// It matches the std::vector<double> min_dist_sq structure perfectly.
@group(0) @binding(1) var<storage, read_write> minDistances : array<f32>;

struct Params {
    r: f32, g: f32, b: f32, a: f32,
    width: u32,
};
@group(0) @binding(2) var<uniform> params : Params;

@compute @workgroup_size(256)
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