#ifndef VISUALIZE_CONTOURS_H
#define VISUALIZE_CONTOURS_H

#include "exported.h"
#include "find_contours.h"
#include <cstdint>

EXPORTED void visualize_contours(uint8_t* pixels, size_t width, size_t height);

#endif // VISUALIZE_CONTOURS_H
