// Input: Floating point texture containing Lab values
// L (x): 0.0 - 100.0
// a (y): approx -128.0 to 127.0
// b (z): approx -128.0 to 127.0
@group(0) @binding(0) var inputTexture : texture_2d<f32>;

// Output: Standard display texture (writes 0-255 automatically)
@group(0) @binding(1) var outputStorage : texture_storage_2d<rgba8unorm, write>;

// --- Constants for Lab -> XYZ (D65 Standard Illuminant) ---
const Xn: f32 = 0.95047;
const Yn: f32 = 1.00000;
const Zn: f32 = 1.08883;

const DELTA: f32 = 0.20689655; // 6.0 / 29.0

// --- Helper Functions ---

// 1. Inverse Lab Transform (converts f(x) back to linear)
fn lab_inverse_f(t: f32) -> f32 {
    // If t > 6/29, result is t^3
    if (t > DELTA) {
        return t * t * t;
    } 
    // Otherwise linear calculation: 3 * (6/29)^2 * (t - 4/29)
    // Simplified: (t - 4/29) / 7.787
    else {
        return 3.0 * DELTA * DELTA * (t - (4.0 / 29.0));
    }
}

// 2. Linear RGB to sRGB (Gamma Encoding)
// Converts linear light to gamma-compressed values for display monitors
fn linear_to_srgb(c: f32) -> f32 {
    // Clamp inputs to valid RGB range before encoding
    let clamped = clamp(c, 0.0, 1.0);
    
    if (clamped <= 0.0031308) {
        return 12.92 * clamped;
    } else {
        return 1.055 * pow(clamped, 1.0 / 2.4) - 0.055;
    }
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let dims = textureDimensions(inputTexture);
    let coords = vec2<i32>(global_id.xy);

    if (coords.x >= i32(dims.x) || coords.y >= i32(dims.y)) {
        return;
    }

    // Load Lab pixel
    let lab_pixel = textureLoad(inputTexture, coords, 0);
    let L = lab_pixel.r; // L*
    let a = lab_pixel.g; // a*
    let b = lab_pixel.b; // b*
    let alpha = lab_pixel.a;

    // -------------------------------------------------
    // Step 1: Convert CIELAB to XYZ
    // -------------------------------------------------
    
    // Calculate intermediate f_y
    let fy = (L + 16.0) / 116.0;
    
    // Calculate f_x and f_z based on f_y
    let fx = fy + (a / 500.0);
    let fz = fy - (b / 200.0);

    // Convert back to normalized XYZ
    let x_norm = lab_inverse_f(fx);
    let y_norm = lab_inverse_f(fy);
    let z_norm = lab_inverse_f(fz);

    // Scale by Reference White (D65)
    let X = x_norm * Xn;
    let Y = y_norm * Yn;
    let Z = z_norm * Zn;

    // -------------------------------------------------
    // Step 2: Convert XYZ to Linear RGB
    // Standard XYZ -> sRGB Matrix (D65)
    // -------------------------------------------------
    let r_lin =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
    let g_lin = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
    let b_lin =  0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;

    // -------------------------------------------------
    // Step 3: Convert Linear RGB to sRGB (Gamma Correct)
    // -------------------------------------------------
    let r_srgb = linear_to_srgb(r_lin);
    let g_srgb = linear_to_srgb(g_lin);
    let b_srgb = linear_to_srgb(b_lin);

    // Store Output
    // Since outputStorage is rgba8unorm, writing these floats (0.0-1.0)
    // will automatically convert them to 0-255 bytes.
    textureStore(outputStorage, coords, vec4<f32>(r_srgb, g_srgb, b_srgb, alpha));
}