#ifndef IMG2NUM_C_H
#define IMG2NUM_C_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

// C-compatible wrapper for Gaussian blur
void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma);

// C-compatible wrapper for image inversion
void invert_image(uint8_t* image, int width, int height);

#ifdef __cplusplus
}
#endif

#endif // IMG2NUM_C_H
