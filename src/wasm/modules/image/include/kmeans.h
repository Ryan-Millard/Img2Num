#ifndef KMEANS_H
#define KMEANS_H

#include <emscripten/emscripten.h>
#include <vector>
#include <cstdlib>
#include <cmath>
#include <limits>
#include <ctime>
#include <cstdint>
#include <iostream>

#include "Image.h"
#include "RGBAPixel.h"
#include "PixelConverters.h"

struct RGB {
	float r, g, b;
};
struct RGBXY {
	float r, g, b;
	float x, y;
};

float colorDistance(const RGB& a, const RGB& b);
float colorSpatialDistance(const RGBXY& a, const RGBXY& b, float spatial_weight);

extern "C" {
    EMSCRIPTEN_KEEPALIVE
    void kmeans_clustering(uint8_t* data, int width, int height, int k, int max_iter);
    void kmeans_clustering_spatial(uint8_t* data, int width, int height, int k, int max_iter, float spatial_weight);
}

#endif