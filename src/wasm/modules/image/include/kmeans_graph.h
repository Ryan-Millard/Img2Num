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

EXPORTED void kmeans_clustering_graph(uint8_t *data, int width, int height, int k,
                                int max_iter, int min_area);
#endif