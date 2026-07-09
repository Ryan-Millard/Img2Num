# RGB ↔ CIELAB Conversion Guide

URL: https://img2num.dev/docs/internal/core/internal-code/cielab/explained

This explains the full mathematical conversion pipeline between **sRGB** and **CIELAB (Lab)** color spaces.

# 1. Conversion Pipeline Overview

## RGBCIELAB

1. sRGBLinear RGB
2. Linear RGBXYZ
3. XYZCIELAB

## CIELABRGB

1. CIELABXYZ
2. XYZLinear RGB
3. Linear RGBsRGB

# 2. sRGB to Linear RGB

sRGB values are gamma‑compressed. Convert them to linear light:

C lin = { C srgb 12.92 , C srgb ≤ 0.04045 ( C srgb + 0.055 1.055 ) 2.4 , C srgb > 0.04045 C_\text{lin} = \begin{cases} \frac{C_\text{srgb}}{12.92}, & C_\text{srgb} \le 0.04045 \\ \left(\frac{C_\text{srgb} + 0.055}{1.055}\right)^{2.4}, & C_\text{srgb} > 0.04045 \end{cases} C lin= ⎩⎨⎧ 12.92C srgb , ( 1.055C srgb + 0.055 ) 2.4,C srgb≤0.04045 C srgb>0.04045This is applied independently to (R), (G), and (B).

# 3. Linear RGB to XYZ

Using the sRGB color space matrix with a D65 white point:

[ X Y Z ] = [ 0.4124564 0.3575761 0.1804375 0.2126729 0.7151522 0.0721750 0.0193339 0.1191920 0.9503041 ] [ R lin G lin B lin ] \begin{bmatrix} X \\ Y \\ Z \end{bmatrix} = \begin{bmatrix} 0.4124564 & 0.3575761 & 0.1804375 \\ 0.2126729 & 0.7151522 & 0.0721750 \\ 0.0193339 & 0.1191920 & 0.9503041 \end{bmatrix} \begin{bmatrix} R_\text{lin} \\ G_\text{lin} \\ B_\text{lin} \end{bmatrix} X Y Z= 0.4124564 0.2126729 0.01933390.3575761 0.7151522 0.11919200.1804375 0.0721750 0.9503041R lin G lin B lin
# 4. XYZ to CIELAB

Normalize XYZ by the D65 reference white:

X n = 0.95047 ,Y n = 1.00000 ,Z n = 1.08883 X_n = 0.95047,\quad Y_n = 1.00000,\quad Z_n = 1.08883 X n= 0.95047 ,Y n= 1.00000 ,Z n= 1.08883x = X X n ,y = Y Y n ,z = Z Z n x = \frac{X}{X_n},\quad y = \frac{Y}{Y_n},\quad z = \frac{Z}{Z_n} x= X nX ,y= Y nY ,z= Z nZDefine the nonlinear function:

f ( t ) = { t 1 / 3 , t > ( 6 29 ) 3 t 3 ( 6 29 ) 2 + 4 29 , t ≤ ( 6 29 ) 3 f(t) = \begin{cases} t^{1/3}, & t > \left(\frac{6}{29}\right)^3 \\ \frac{t}{3\left(\frac{6}{29}\right)^2} + \frac{4}{29}, & t \le \left(\frac{6}{29}\right)^3 \end{cases} f ( t )= ⎩⎨⎧ t 1/3 , 3 ( 296 ) 2t+294 ,t>( 296 ) 3 t≤( 296 ) 3Then compute Lab:

L ∗ = 116 f ( y ) − 16 L^* = 116 f(y) - 16 L ∗= 116 f ( y )− 16a ∗ = 500 [ f ( x ) − f ( y ) ] a^* = 500 \left[f(x) - f(y)\right] a ∗= 500[ f ( x )−f ( y ) ]b ∗ = 200 [ f ( y ) − f ( z ) ] b^* = 200 \left[f(y) - f(z)\right] b ∗= 200[ f ( y )−f ( z ) ]
# 5. CIELAB to XYZ

The inverse of (f(t)):

f − 1 ( t ) = { t 3 , t > 6 29 3 ( 6 29 ) 2 ( t − 4 29 ) , t ≤ 6 29 f^{-1}(t) = \begin{cases} t^3, & t > \frac{6}{29} \\ 3\left(\frac{6}{29}\right)^2 \left(t - \frac{4}{29}\right), & t \le \frac{6}{29} \end{cases} f − 1 ( t )= { t 3 , 3( 296 ) 2( t−294 ),t>296 t≤296Compute:

f y = L + 16 116 ,f x = f y + a 500 ,f z = f y − b 200 f_y = \frac{L + 16}{116}, \quad f_x = f_y + \frac{a}{500}, \quad f_z = f_y - \frac{b}{200} f y= 116L+16 ,f x= f y+ 500a ,f z= f y− 200bX = X n f − 1 ( f x ) ,Y = Y n f − 1 ( f y ) ,Z = Z n f − 1 ( f z ) X = X_n f^{-1}(f_x),\quad Y = Y_n f^{-1}(f_y),\quad Z = Z_n f^{-1}(f_z) X= X n f − 1 ( f x ) ,Y= Y n f − 1 ( f y ) ,Z= Z n f − 1 ( f z )
# 6. XYZ to Linear RGB

[ R lin G lin B lin ] = [ 3.240970 − 1.537383 − 0.498611 − 0.969244 1.875968 0.041555 0.055630 − 0.203977 1.056972 ] [ X Y Z ] \begin{bmatrix} R_\text{lin} \\ G_\text{lin} \\ B_\text{lin} \end{bmatrix} = \begin{bmatrix} 3.240970 & -1.537383 & -0.498611 \\ -0.969244 & 1.875968 & 0.041555 \\ 0.055630 & -0.203977 & 1.056972 \end{bmatrix} \begin{bmatrix} X \\ Y \\ Z \end{bmatrix} R lin G lin B lin= 3.240970 − 0.969244 0.055630− 1.537383 1.875968 − 0.203977− 0.498611 0.041555 1.056972X Y Z
# 7. Linear RGB to sRGB

C srgb = { 12.92C lin , C lin ≤ 0.0031308 1.055C lin 1 / 2.4 − 0.055 , C lin > 0.0031308 C_\text{srgb} = \begin{cases} 12.92\, C_\text{lin}, & C_\text{lin} \le 0.0031308 \\ 1.055\, C_\text{lin}^{1/2.4} - 0.055, & C_\text{lin} > 0.0031308 \end{cases} C srgb= { 12.92C lin , 1.055C lin 1/2.4−0.055 ,C lin≤0.0031308 C lin>0.0031308Clamp results to ([0,1]) and scaled by 255 before converting to 8‑bit.

# 8. Summary

## RGBLab

- Remove gamma (sRGBlinear)
- Convert to XYZ
- Normalize by D65
- Apply nonlinear transform
- Produce L*, a*, b*

## LabRGB

- Convert LabXYZ via inverse nonlinear transform
- XYZlinear RGB
- Linear RGBsRGB (gamma)
- Clamp to valid output

# 9. References

- CIE 1976 L*a*b* Specification
- IEC 61966‑2‑1 sRGB Standard
