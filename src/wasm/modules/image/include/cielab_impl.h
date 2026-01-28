#ifndef CIELAB_IMPL_H
#define CIELAB_IMPL_H

#ifndef CIELAB_H
#error "cielab_impl.h should not be included directly; include cielab.h instead"
#endif

#include <algorithm>
#include <cmath>

// ====== Used in xyz_to_lab =======
constexpr double DELTA{6.0 / 29.0};                  // 0.2068966
constexpr double DELTA_CUBED{DELTA * DELTA * DELTA}; // 0.008856
constexpr double KAPPA{1.0 / (3.0 * DELTA * DELTA)}; // 7.787
constexpr double EPSILON{16.0 / 116.0};              // 0.137931

// ====== Used in srgb_to_linear ======
constexpr double SRGB_LINEAR_THRESHOLD{0.04045}; // linear segment boundary
constexpr double SRGB_LINEAR_FACTOR{12.92}; // scale factor for linear segment
constexpr double SRGB_GAMMA_OFFSET{0.055};  // offset for nonlinear segment
constexpr double SRGB_GAMMA{2.4}; // gamma exponent for nonlinear segment
constexpr double SRGB_GAMMA_INV{
    1.0 / SRGB_GAMMA}; // gamma exponent for nonlinear segment

/*
 * ====== Used in rgb_to_lab ======
 *
 * sRGB Khronos/W3C Transformation Matrices (D65 illuminant)
 *
 * sRGB → CIE XYZ:
 * ┌   ┐   ┌                                 ┐ ┌   ┐
 * │ X │   │ 0.4124564  0.3575761  0.1804375 │ │ R │
 * │ Y │ = │ 0.2126729  0.7151522  0.0721750 │ │ G │
 * │ Z │   │ 0.0193339  0.1191920  0.9503041 │ │ B │
 * └   ┘   └                                 ┘ └   ┘
 *
 * Reference: ITU-R BT.709 / sRGB standard (IEC 61966-2-1:1999)
 */
constexpr double SRGB_R_TO_X{0.4124564};
constexpr double SRGB_G_TO_X{0.3575761};
constexpr double SRGB_B_TO_X{0.1804375};
constexpr double SRGB_R_TO_Y{0.2126729};
constexpr double SRGB_G_TO_Y{0.7151522};
constexpr double SRGB_B_TO_Y{0.0721750};
constexpr double SRGB_R_TO_Z{0.0193339};
constexpr double SRGB_G_TO_Z{0.1191920};
constexpr double SRGB_B_TO_Z{0.9503041};

/*
 * ====== Used in lab_to_rgb ======
 *
 * sRGB Khronos/W3C Transformation Matrices (D65 illuminant)
 * Inverse transformation (XYZ → sRGB) per Khronos/W3C, D65 white, slightly
 * different from original BT.709 inverse.
 *
 * CIE XYZ → sRGB (inverse):
 * ┌   ┐   ┌                               ┐ ┌   ┐
 * │ R │   │  3.240970 -1.537383 -0.498611 │ │ X │
 * │ G │ = │ -0.969244  1.875968  0.041555 │ │ Y │
 * │ B │   │  0.055630 -0.203977  1.056972 │ │ Z │
 * └   ┘   └                               ┘ └   ┘
 *
 * Reference: ITU-R BT.709 / sRGB standard (IEC 61966-2-1:1999)
 */
constexpr double SRGB_X_TO_R{3.240970};
constexpr double SRGB_Y_TO_R{-1.537383};
constexpr double SRGB_Z_TO_R{-0.498611};
constexpr double SRGB_X_TO_G{-0.969244};
constexpr double SRGB_Y_TO_G{1.875968};
constexpr double SRGB_Z_TO_G{0.041555};
constexpr double SRGB_X_TO_B{0.055630};
constexpr double SRGB_Y_TO_B{-0.203977};
constexpr double SRGB_Z_TO_B{1.056972};

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
  return (safe_t > DELTA_CUBED) ? std::cbrt(safe_t)
                                : (KAPPA * safe_t) + EPSILON;
}

// Function for the non-linear sRGB to linear RGB transformation (inverse gamma
// correction)
inline double srgb_to_linear(const double c) {
  const double safe_c{std::clamp(c, 0.0, 1.0)};
  return (safe_c <= SRGB_LINEAR_THRESHOLD)
             ? safe_c / SRGB_LINEAR_FACTOR
             : std::pow((safe_c + SRGB_GAMMA_OFFSET) /
                            (1.0 + SRGB_GAMMA_OFFSET),
                        SRGB_GAMMA);
}

template <typename Tin, typename Tout>
void rgb_to_lab(const Tin r_u8, const Tin g_u8, const Tin b_u8, Tout &out_l,
                Tout &out_a, Tout &out_b) {
  // 1. Convert 8-bit RGB [0, 255] to linear RGB [0.0, 1.0]

  double _r = static_cast<double>(r_u8);
  double _g = static_cast<double>(g_u8);
  double _b = static_cast<double>(b_u8);

  double r{srgb_to_linear(_r / 255.0)};
  double g{srgb_to_linear(_g / 255.0)};
  double b{srgb_to_linear(_b / 255.0)};

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
  out_l = static_cast<Tout>(LAB_L_FACTOR * fy - LAB_L_OFFSET);
  out_a = static_cast<Tout>(LAB_A_FACTOR * (fx - fy));
  out_b = static_cast<Tout>(LAB_B_FACTOR * (fy - fz));

  out_l = std::clamp(out_l, static_cast<Tout>(0.0), static_cast<Tout>(100.0));
}

constexpr double inverse_xyz_to_lab(double t) {
  return (t > DELTA) ? (t * t * t) : (3 * DELTA * DELTA * (t - EPSILON));
}

inline double gamma_encode(double u) {
  // Guard against negative values from out-of-gamut colors
  u = std::max(0.0, u);
  return (u <= SRGB_LINEAR_THRESHOLD / SRGB_LINEAR_FACTOR)
             ? SRGB_LINEAR_FACTOR * u
             : (1.0 + SRGB_GAMMA_OFFSET) * std::pow(u, SRGB_GAMMA_INV) -
                   SRGB_GAMMA_OFFSET;
}

template <typename Tin, typename Tout>
void lab_to_rgb(const Tin L, const Tin A, const Tin B, Tout &out_r_u8,
                Tout &out_g_u8, Tout &out_b_u8) {

  const double _L = static_cast<double>(L);
  const double _A = static_cast<double>(A);
  const double _B = static_cast<double>(B);

  // --- Lab → XYZ (D65 white point)
  const double fy{(_L + LAB_L_OFFSET) / LAB_L_FACTOR};
  const double fx{fy + _A / LAB_A_FACTOR};
  const double fz{fy - _B / LAB_B_FACTOR};

  const double X{D65_Xn * inverse_xyz_to_lab(fx)};
  const double Y{D65_Yn * inverse_xyz_to_lab(fy)};
  const double Z{D65_Zn * inverse_xyz_to_lab(fz)};

  // --- XYZ → linear RGB (sRGB)
  double r{SRGB_X_TO_R * X + SRGB_Y_TO_R * Y + SRGB_Z_TO_R * Z};
  double g{SRGB_X_TO_G * X + SRGB_Y_TO_G * Y + SRGB_Z_TO_G * Z};
  double b{SRGB_X_TO_B * X + SRGB_Y_TO_B * Y + SRGB_Z_TO_B * Z};

  // --- linear RGB → sRGB (gamma correction)
  r = gamma_encode(std::clamp(r, 0.0, 1.0));
  g = gamma_encode(std::clamp(g, 0.0, 1.0));
  b = gamma_encode(std::clamp(b, 0.0, 1.0));

  // --- Clamp and convert to 8-bit
  out_r_u8 = static_cast<Tout>(std::round(255.0 * std::clamp(r, 0.0, 1.0)));
  out_g_u8 = static_cast<Tout>(std::round(255.0 * std::clamp(g, 0.0, 1.0)));
  out_b_u8 = static_cast<Tout>(std::round(255.0 * std::clamp(b, 0.0, 1.0)));
}

template <typename Tin, typename Tout>
void rgb_to_lab(const ImageLib::RGBAPixel<Tin> &rgba,
                ImageLib::LABAPixel<Tout> &laba) {

  rgb_to_lab<Tin, Tout>(rgba.red, rgba.green, rgba.blue, laba.l, laba.a,
                        laba.b);
  laba.alpha = static_cast<Tout>(rgba.alpha);
}

template <typename Tin, typename Tout>
void rgb_to_lab(const ImageLib::RGBPixel<Tin> &rgb,
                ImageLib::LABPixel<Tout> &lab) {

  rgb_to_lab<Tin, Tout>(rgb.red, rgb.green, rgb.blue, lab.l, lab.a, lab.b);
}

template <typename Tin, typename Tout>
void lab_to_rgb(const ImageLib::LABAPixel<Tin> &laba,
                ImageLib::RGBAPixel<Tout> &rgba) {

  lab_to_rgb<Tin, Tout>(laba.l, laba.a, laba.b, rgba.red, rgba.green,
                        rgba.blue);
  rgba.alpha = static_cast<Tout>(laba.alpha);
}

template <typename Tin, typename Tout>
void lab_to_rgb(const ImageLib::LABPixel<Tin> &lab,
                ImageLib::RGBPixel<Tout> &rgb) {

  lab_to_rgb<Tin, Tout>(lab.l, lab.a, lab.b, rgb.red, rgb.green, rgb.blue);
}

#endif