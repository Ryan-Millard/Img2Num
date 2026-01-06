---
id: explained
title: Implementation Explained
sidebar_position: 5
---


# RGB ↔ CIELAB Conversion Guide

This explains the full mathematical conversion pipeline between **sRGB** and **CIELAB (Lab)** color spaces.  

---

# 1. Conversion Pipeline Overview

## RGB → CIELAB
1. sRGB → Linear RGB  
2. Linear RGB → XYZ  
3. XYZ → CIELAB  

## CIELAB → RGB
1. CIELAB → XYZ  
2. XYZ → Linear RGB  
3. Linear RGB → sRGB  

---

# 2. sRGB to Linear RGB

sRGB values are gamma‑compressed. Convert them to linear light:
```math

C_\text{lin} =
\begin{cases}
\frac{C_\text{srgb}}{12.92}, & C_\text{srgb} \le 0.04045 \\
\left(\frac{C_\text{srgb} + 0.055}{1.055}\right)^{2.4}, & C_\text{srgb} > 0.04045
\end{cases}

```

This is applied independently to \(R\), \(G\), and \(B\).

---

# 3. Linear RGB to XYZ

Using the sRGB color space matrix with a D65 white point:
```math

\begin{bmatrix}
X \\ Y \\ Z
\end{bmatrix}
=
\begin{bmatrix}
0.4124564 & 0.3575761 & 0.1804375 \\
0.2126729 & 0.7151522 & 0.0721750 \\
0.0193339 & 0.1191920 & 0.9503041
\end{bmatrix}
\begin{bmatrix}
R_\text{lin} \\ G_\text{lin} \\ B_\text{lin}
\end{bmatrix}

```
---

# 4. XYZ to CIELAB

Normalize XYZ by the D65 reference white:

```math
X_n = 0.95047,\quad Y_n = 1.00000,\quad Z_n = 1.08883
```
```math
x = \frac{X}{X_n},\quad y = \frac{Y}{Y_n},\quad z = \frac{Z}{Z_n}
```

Define the nonlinear function:

```math
f(t) =
\begin{cases}
t^{1/3}, & t > \left(\frac{6}{29}\right)^3 \\
\frac{t}{3\left(\frac{6}{29}\right)^2} + \frac{4}{29}, & t \le \left(\frac{6}{29}\right)^3
\end{cases}
```

Then compute Lab:

```math
L^* = 116 f(y) - 16
```

```math
a^* = 500 \left[f(x) - f(y)\right]
```

```math
b^* = 200 \left[f(y) - f(z)\right]
```

---

# 5. CIELAB to XYZ

The inverse of \(f(t)\):

```math
f^{-1}(t) =
\begin{cases}
t^3, & t > \frac{6}{29} \\
3\left(\frac{6}{29}\right)^2 \left(t - \frac{4}{29}\right), & t \le \frac{6}{29}
\end{cases}
```

Compute:

```math
f_y = \frac{L + 16}{116}, \quad
f_x = f_y + \frac{a}{500}, \quad
f_z = f_y - \frac{b}{200}
```

```math
X = X_n f^{-1}(f_x),\quad
Y = Y_n f^{-1}(f_y),\quad
Z = Z_n f^{-1}(f_z)
```

---

# 6. XYZ to Linear RGB

```math
\begin{bmatrix}
R_\text{lin} \\ G_\text{lin} \\ B_\text{lin}
\end{bmatrix}
=
\begin{bmatrix}
 3.2406 & -1.5372 & -0.4986 \\
-0.9689 &  1.8758 &  0.0415 \\
 0.0557 & -0.2040 &  1.0570
\end{bmatrix}
\begin{bmatrix}
X \\ Y \\ Z
\end{bmatrix}
```

---

# 7. Linear RGB to sRGB

```math
C_\text{srgb} =
\begin{cases}
12.92\, C_\text{lin}, & C_\text{lin} \le 0.0031308 \\
1.055\, C_\text{lin}^{1/2.4} - 0.055, & C_\text{lin} > 0.0031308
\end{cases}
```

Clamp results to \([0,1]\) and scaled by 255 before converting to 8‑bit.

---

# 8. Summary

## RGB → Lab
- Remove gamma (sRGB → linear)  
- Convert to XYZ  
- Normalize by D65  
- Apply nonlinear transform  
- Produce L\*, a\*, b\*  

## Lab → RGB
- Convert Lab → XYZ via inverse nonlinear transform  
- XYZ → linear RGB  
- Linear RGB → sRGB (gamma)  
- Clamp to valid output  

---

# 9. References
- CIE 1976 L\*a\*b\* Specification  
- IEC 61966‑2‑1 sRGB Standard  
