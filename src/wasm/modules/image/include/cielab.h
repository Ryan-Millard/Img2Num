#ifndef CIELAB_H
#define CIELAB_H

#include <cstdint>

void rgb_to_lab(const uint8_t r_u8, const uint8_t g_u8, const uint8_t b_u8,
                double& out_l, double& out_a, double& out_b);
void rgb_to_lab2(uint8_t r_u8, uint8_t g_u8, uint8_t b_u8, double& L, double& A, double& B);
#endif // CIELAB_H
