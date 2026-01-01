#include <cmath>
#include <iostream>
#include <algorithm>

// Function for the non-linear XYZ to Lab transformation
double f_xyz(double t) {
    if (t > 0.008856) {
        return std::pow(t, 1.0/3.0);
    } else {
        return (7.787 * t) + (16.0 / 116.0);
    }
}

// Function for the non-linear sRGB to linear RGB transformation (inverse gamma correction)
double inverse_gamma(double c) {
    if (c > 0.04045) {
        return std::pow((c + 0.055) / 1.055, 2.4);
    } else {
        return c / 12.92;
    }
}

void rgb_to_lab(unsigned char r_u8, unsigned char g_u8, unsigned char b_u8, double& L, double& A, double& B) {
    // 1. Convert 8-bit RGB [0, 255] to linear RGB [0.0, 1.0]
    double r = r_u8 / 255.0;
    double g = g_u8 / 255.0;
    double b = b_u8 / 255.0;

    r = inverse_gamma(r);
    g = inverse_gamma(g);
    b = inverse_gamma(b);

    // 2. Convert linear RGB to CIE XYZ (using D65 white point reference)
    // The matrix below is for sRGB to XYZ (D65)
    double x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
    double y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b;
    double z = 0.0193339 * r + 0.1191920 * g + 0.9503041 * b;

    // Reference white point for D65 illuminant
    const double Xn = 0.95047;
    const double Yn = 1.00000;
    const double Zn = 1.08883;

    // Normalize XYZ values by the white point
    double Xr = x / Xn;
    double Yr = y / Yn;
    double Zr = z / Zn;

    // 3. Convert CIE XYZ to CIE L*a*b*
    double fx = f_xyz(Xr);
    double fy = f_xyz(Yr);
    double fz = f_xyz(Zr);

    L = 116.0 * fy - 16.0;
    A = 500.0 * (fx - fy);
    B = 200.0 * (fy - fz);
    
    // Clamp L channel to standard range [0, 100]
    L = std::max(0.0, std::min(100.0, L));
}