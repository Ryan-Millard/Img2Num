@group(0) @binding(0) var inputTexture : texture_2d<f32>;

// Output: Floating point storage texture.
// MUST use rgba16float or rgba32float to handle Lab ranges (L: 0-100, a/b: negative values)
@group(0) @binding(1) var outputStorage : texture_storage_2d<rgba32float, write>;

// --- Constants for XYZ -> Lab conversion (D65 Standard Illuminant) ---
const Xn: f32 = 0.95047;
const Yn: f32 = 1.00000;
const Zn: f32 = 1.08883;

// Constants related to the XYZ/Lab transfer function threshold (6/29)
const DELTA: f32 = 0.20689655; // 6.0 / 29.0
const DELTA_CUBED: f32 = 0.00885645; // DELTA * DELTA * DELTA
const FACTOR_M: f32 = 7.787037; // (1/3) * (29/6)^2
const OFFSET_A: f32 = 0.137931; // 4 / 29

// --- Helper Functions ---

// 1. sRGB Inverse Gamma Correction (sRGB -> Linear RGB)
// Accurate formula, not just pow(c, 2.2)
fn srgb_to_linear(c: f32) -> f32 {
    if (c <= 0.04045) {
        return c / 12.92;
    } else {
        // Using 2.4 power approximation for the upper curve
        return pow((c + 0.055) / 1.055, 2.4);
    }
}

// 2. The non-linear transform function used in XYZ -> Lab
fn lab_f(t: f32) -> f32 {
    if (t > DELTA_CUBED) {
        return pow(t, 1.0 / 3.0);
    } else {
        return (FACTOR_M * t) + OFFSET_A;
    }
}

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let dims = textureDimensions(inputTexture);
    let coords = vec2<i32>(global_id.xy);

    // Boundary check
    if (coords.x >= i32(dims.x) || coords.y >= i32(dims.y)) {
        return;
    }

    // Load sRGB pixel (assuming 0.0-1.0 range)
    let rgba = textureLoad(inputTexture, coords, 0);
    
    // Remove Alpha for calculation
    let srgb = rgba.rgb;

    // -------------------------------------------------
    // Step 1: Convert sRGB to Linear RGB
    // -------------------------------------------------
    let r_lin = srgb_to_linear(srgb.r);
    let g_lin = srgb_to_linear(srgb.g);
    let b_lin = srgb_to_linear(srgb.b);

    // -------------------------------------------------
    // Step 2: Convert Linear RGB to CIE XYZ (D65)
    // Using standard sRGB to XYZ matrix
    // -------------------------------------------------
    let x = r_lin * 0.4124564 + g_lin * 0.3575761 + b_lin * 0.1804375;
    let y = r_lin * 0.2126729 + g_lin * 0.7151522 + b_lin * 0.0721750;
    let z = r_lin * 0.0193339 + g_lin * 0.1191920 + b_lin * 0.9503041;

    // -------------------------------------------------
    // Step 3: Convert XYZ to CIELAB
    // -------------------------------------------------
    // Normalize XYZ against reference white point
    let x_norm = x / Xn;
    let y_norm = y / Yn;
    let z_norm = z / Zn;

    // Apply transform function
    let fx = lab_f(x_norm);
    let fy = lab_f(y_norm);
    let fz = lab_f(z_norm);

    // Calculate L*a*b*
    let L = 116.0 * fy - 16.0;
    let a = 500.0 * (fx - fy);
    let b = 200.0 * (fy - fz);

    // Write result to floating point storage texture.
    // We keep the original alpha channel.
    textureStore(outputStorage, coords, vec4<f32>(L, a, b, rgba.a));
}