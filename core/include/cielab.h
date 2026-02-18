#ifndef CIELAB_H
#define CIELAB_H

#include <cstdint>
#include <type_traits>

#include "LABAPixel.h"
#include "LABPixel.h"
#include "RGBAPixel.h"
#include "RGBPixel.h"

// templates must be in headers

template <typename Tin, typename Tout>
void rgb_to_lab(const Tin r_u8, const Tin g_u8, const Tin b_u8, Tout &out_l, Tout &out_a,
                Tout &out_b);

template <typename Tin, typename Tout>
void lab_to_rgb(const Tin L, const Tin A, const Tin B, Tout &r_u8, Tout &g_u8, Tout &b_u8);

template <typename Tin, typename Tout>
void rgb_to_lab(const ImageLib::RGBAPixel<Tin> &rgba, ImageLib::LABAPixel<Tout> &laba);

template <typename Tin, typename Tout>
void rgb_to_lab(const ImageLib::RGBPixel<Tin> &rgb, ImageLib::LABPixel<Tout> &lab);

template <typename Tin, typename Tout>
void lab_to_rgb(const ImageLib::LABAPixel<Tin> &laba, ImageLib::RGBAPixel<Tout> &rgba);

template <typename Tin, typename Tout>
void lab_to_rgb(const ImageLib::LABPixel<Tin> &lab, ImageLib::RGBPixel<Tout> &rgb);

#include "cielab_impl.h"

#endif  // CIELAB_H
