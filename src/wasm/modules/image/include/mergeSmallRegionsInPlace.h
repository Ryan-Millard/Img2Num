#ifndef MERGESMALLREGIONSINPLACE_H
#define MERGESMALLREGIONSINPLACE_H

#include "exported.h" // EXPORTED macro
#include <cstdint>

// pixels: RGBA uint8_t* buffer
// width, height: dimensions
// minArea: minimum area to preserve (smaller regions get merged)
EXPORTED void mergeSmallRegionsInPlace(uint8_t* pixels, int width, int height, int minArea, int minWidth, int minHeight);
#endif
