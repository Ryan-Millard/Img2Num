#ifndef KMEANS_GRAPH_H
#define KMEANS_GRAPH_H

#include "exported.h" // EXPORTED macro

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <iostream>
#include <limits>
#include <vector>
#include <set>
#include <map>
#include <memory>

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include "graph.h"

EXPORTED void kmeans_clustering_graph(uint8_t* data, int32_t* labels, int width, int height, int min_area);
#endif
