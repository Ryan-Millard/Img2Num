#include "cielab.h"
#include <cmath>
#include <algorithm>

// ====== Used in xyz_to_lab =======
constexpr double DELTA{6.0 / 29.0};                   // 0.2068966
constexpr double DELTA_CUBED{DELTA * DELTA * DELTA};  // 0.008856
constexpr double KAPPA{1.0 / (3.0 * DELTA * DELTA)};  // 7.787
constexpr double EPSILON{16.0 / 116.0};               // 0.137931

// ====== Used in srgb_to_linear ======
constexpr double SRGB_LINEAR_THRESHOLD{0.04045};   // linear segment boundary
constexpr double SRGB_LINEAR_FACTOR{12.92};        // scale factor for linear segment
constexpr double SRGB_GAMMA_OFFSET{0.055};         // offset for nonlinear segment
constexpr double SRGB_GAMMA{2.4};                  // gamma exponent for nonlinear segment
constexpr double SRGB_GAMMA_INV{1.0 / SRGB_GAMMA}; // gamma exponent for nonlinear segment

// ====== Used in rgb_to_lab ======
// Multipliers for RGB to XYZ
constexpr double SRGB_R_TO_X{0.4124564};
constexpr double SRGB_G_TO_X{0.3575761};
constexpr double SRGB_B_TO_X{0.1804375};
constexpr double SRGB_R_TO_Y{0.2126729};
constexpr double SRGB_G_TO_Y{0.7151522};
constexpr double SRGB_B_TO_Y{0.0721750};
constexpr double SRGB_R_TO_Z{0.0193339};
constexpr double SRGB_G_TO_Z{0.1191920};
constexpr double SRGB_B_TO_Z{0.9503041};

constexpr double SRGB_X_TO_R{3.2406};
constexpr double SRGB_Y_TO_R{-1.5372};
constexpr double SRGB_Z_TO_R{-0.4986};
constexpr double SRGB_X_TO_G{-0.9689};
constexpr double SRGB_Y_TO_G{1.8758};
constexpr double SRGB_Z_TO_G{0.0415};
constexpr double SRGB_X_TO_B{0.0557};
constexpr double SRGB_Y_TO_B{-0.2040};
constexpr double SRGB_Z_TO_B{1.0570};

// Reference white point for D65 illuminant
constexpr double D65_Xn{0.95047};
constexpr double D65_Yn{1.0};
constexpr double D65_Zn{1.08883};

constexpr double LAB_L_FACTOR{116.0};
constexpr double LAB_L_OFFSET{16.0};
constexpr double LAB_A_FACTOR{500.0};
constexpr double LAB_B_FACTOR{200.0};

// Function for the non-linear XYZ to Lab transformation
inline double xyz_to_lab(const double t) {
  // prevent negative due to tiny floating errors
  const double safe_t{std::max(0.0, t)};
  return (safe_t > DELTA_CUBED) ? std::cbrt(safe_t) : (KAPPA * safe_t) + EPSILON;
}

// Function for the non-linear sRGB to linear RGB transformation (inverse gamma correction)
inline double srgb_to_linear(const double c) {
    const double safe_c{std::clamp(c, 0.0, 1.0)};
    return (safe_c <= SRGB_LINEAR_THRESHOLD)
        ? safe_c / SRGB_LINEAR_FACTOR
        : std::pow((safe_c + SRGB_GAMMA_OFFSET) / (1.0 + SRGB_GAMMA_OFFSET), SRGB_GAMMA);
}

void rgb_to_lab(const uint8_t r_u8, const uint8_t g_u8, const uint8_t b_u8,
                double& out_l, double& out_a, double& out_b) {
    // 1. Convert 8-bit RGB [0, 255] to linear RGB [0.0, 1.0]
    double r{srgb_to_linear(r_u8 / 255.0)};
    double g{srgb_to_linear(g_u8 / 255.0)};
    double b{srgb_to_linear(b_u8 / 255.0)};

    // 2. Convert linear RGB to CIE XYZ (using D65 white point reference)
    // The matrix below is for sRGB to XYZ (D65)
    const double x{SRGB_R_TO_X * r + SRGB_G_TO_X * g + SRGB_B_TO_X * b};
    const double y{SRGB_R_TO_Y * r + SRGB_G_TO_Y * g + SRGB_B_TO_Y * b};
    const double z{SRGB_R_TO_Z * r + SRGB_G_TO_Z * g + SRGB_B_TO_Z * b};

    // Normalize XYZ values by the white point
    const double Xr{x / D65_Xn};
    const double Yr{y / D65_Yn};
    const double Zr{z / D65_Zn};

    // 3. Convert CIE XYZ to CIE L*a*b*
    const double fx{xyz_to_lab(Xr)};
    const double fy{xyz_to_lab(Yr)};
    const double fz{xyz_to_lab(Zr)};

    // 4. Output values
    out_l = LAB_L_FACTOR * fy - LAB_L_OFFSET;
    out_a = LAB_A_FACTOR * (fx - fy);
    out_b = LAB_B_FACTOR * (fy - fz);

    out_l = std::clamp(out_l, 0.0, 100.0);
}

constexpr double inverse_xyz_to_lab(double t)
{
  return (t > DELTA) ? (t * t * t) : (3 * DELTA * DELTA * (t - EPSILON));
}

constexpr double gamma_encode(double u) {
  return (u <= SRGB_LINEAR_THRESHOLD / SRGB_LINEAR_FACTOR)
    ? SRGB_LINEAR_FACTOR * u
    : (1.0 + SRGB_GAMMA_OFFSET) * std::pow(u, SRGB_GAMMA_INV) - SRGB_GAMMA_OFFSET;
};

void lab_to_rgb(const double L, const double A, const double B,
                uint8_t& out_r_u8, uint8_t& out_g_u8, uint8_t& out_b_u8)
{
    // --- Lab → XYZ (D65 white point)
    const double fy{(L + LAB_L_OFFSET) / LAB_L_FACTOR};
    const double fx{fy + A / LAB_A_FACTOR};
    const double fz{fy - B / LAB_B_FACTOR};

    const double X{D65_Xn * inverse_xyz_to_lab(fx)};
    const double Y{D65_Yn * inverse_xyz_to_lab(fy)};
    const double Z{D65_Zn * inverse_xyz_to_lab(fz)};

    // --- XYZ → linear RGB (sRGB)
    double r{SRGB_X_TO_R * X + SRGB_Y_TO_R * Y + SRGB_Z_TO_R * Z};
    double g{SRGB_X_TO_G * X + SRGB_Y_TO_G * Y + SRGB_Z_TO_G * Z};
    double b{SRGB_X_TO_B * X + SRGB_Y_TO_B * Y + SRGB_Z_TO_B * Z};

    // --- linear RGB → sRGB (gamma correction)
    r = gamma_encode(r);
    g = gamma_encode(g);
    b = gamma_encode(b);

    // --- Clamp and convert to 8-bit
    out_r_u8 = static_cast<uint8_t>(std::round(255.0 * std::clamp(r, 0.0, 1.0)));
    out_g_u8 = static_cast<uint8_t>(std::round(255.0 * std::clamp(g, 0.0, 1.0)));
    out_b_u8 = static_cast<uint8_t>(std::round(255.0 * std::clamp(b, 0.0, 1.0)));
}
