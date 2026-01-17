// TODO: The kmeans algorithm actually ignores the values of alpha where it
// should actually be taken into account.

#include "kmeans_graph.h"
#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"
#include "contours.h"
#include "graph.h"
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <iostream>
#include <limits>
#include <map>
#include <memory>
#include <random>
#include <set>
#include <vector>

/* Flood fill */
int flood_fill(std::vector<int> &label_array, std::vector<int> &region_array,
               const uint8_t *color_array, int x, int y, int target_value,
               int label_value, size_t width, size_t height,
               std::unique_ptr<std::vector<RGBXY>> &out_pixels) {
  std::queue<XY> queue;
  auto index = [width](int x, int y) { return y * width + x; };

  int count = 0;
  int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

  RGBXY pix = RGBXY{color_array[4 * size_t(index(x, y))],
                    color_array[4 * size_t(index(x, y)) + 1],
                    color_array[4 * size_t(index(x, y)) + 2], x, y};

  queue.push({x, y});

  region_array[size_t(index(x, y))] = label_value;

  out_pixels->push_back(pix);
  count++;

  while (!queue.empty()) {
    XY c = queue.front();
    queue.pop();
    for (auto &d : dirs) {
      int x1 = c.x + d[0];
      int y1 = c.y + d[1];

      // check conditions
      if ((x1 >= 0) && (x1 < int(width)) && (y1 >= 0) && (y1 < int(height)) &&
          (label_array[size_t(index(x1, y1))] == target_value) &&
          (region_array[size_t(index(x1, y1))] == -1)) {
        RGBXY pix1 = RGBXY{color_array[4 * size_t(index(x1, y1))],
                           color_array[4 * size_t(index(x1, y1)) + 1],
                           color_array[4 * size_t(index(x1, y1)) + 2], x1, y1};
        region_array[size_t(index(x1, y1))] = label_value;
        out_pixels->push_back(pix1);
        count++;

        queue.push({x1, y1});
      }
    }
  }

  return count;
}

void region_labeling(const uint8_t *data, std::vector<int> &labels,
                     std::vector<int> &regions, int width, int height,
                     std::vector<Node_ptr> &nodes) {
  auto index = [width](int x, int y) { return y * width + x; };

  regions.resize(static_cast<size_t>(height) * static_cast<size_t>(width), -1);
  int r_lbl = -1;

  for (int i = 0; i < width; i++) {
    for (int j = 0; j < height; j++) {

      int label = labels[size_t(index(i, j))];
      int rlab = regions[size_t(index(i, j))];

      if (rlab == -1) {
        r_lbl++;
        // track pixels for this region
        // std::vector<RGBXY> pixels;
        std::unique_ptr<std::vector<RGBXY>> p_ptr =
            std::make_unique<std::vector<RGBXY>>();
        int counts = flood_fill(labels, regions, data, i, j, label, r_lbl,
                                width, height, p_ptr);
        int num_pixels = p_ptr->size();

        // num_pixels == counts always
        Node_ptr n_ptr = std::make_shared<Node>(r_lbl, p_ptr);
        nodes.push_back(n_ptr);
      }
    }
  }
}

void visualize_contours(const std::vector<std::vector<Point>> &contours,
                        std::vector<uint8_t> &results, int width, int height,
                        int xmin = 0, int ymin = 0) {
  auto index = [width](int x, int y) { return y * width + x; };

  // Random generator for colors
  static std::mt19937 rng(std::random_device{}());
  static std::uniform_int_distribution<int> dist(0, 255);

  for (const auto &c : contours) {
    uint8_t color[4] = {static_cast<uint8_t>(dist(rng)),
                        static_cast<uint8_t>(dist(rng)),
                        static_cast<uint8_t>(dist(rng)), 255};

    for (const auto &p : c) {
      int _x = p.x + xmin;
      int _y = p.y + ymin;

      // Ensure within bounds
      if (_x < 0 || _x >= width || _y < 0 || _y >= height)
        continue;

      size_t idx = 4 * static_cast<size_t>(index(_x, _y));
      results[idx] = color[0];
      results[idx + 1] = color[1];
      results[idx + 2] = color[2];
      results[idx + 3] = color[3];
    }
  }
}

/*
 *Parameters:
 *data: uint8_t* -> output image from K-Means in RGBA repeating format
 *([r,g,b,a, r,g,b,a, ...]) labels: int32_t* -> output of labelled regions from
 *K-Means, should be 1/4 the size of data since data is RGBA width, height: int
 *-> dimensions of image data represents (1/4 of the dimension data holds since
 *each pixel is RGBA)
 *
 * labels : width * height : number of pixels in image = 1 : 1 : 1
 */
void kmeans_clustering_graph(uint8_t *data, int32_t *labels, const int width,
                             const int height, const int min_area,
                             const bool draw_contour_borders) {
  const int32_t num_pixels{width * height};
  std::vector<int32_t> kmeans_labels{labels, labels + num_pixels};
  std::vector<int> region_labels;

  // 1. enumerate regions and convert to Nodes
  std::vector<Node_ptr> nodes;
  region_labeling(data, kmeans_labels, region_labels, width, height, nodes);

  // 2. initialize Graph from all Nodes
  std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
  Graph G(node_ptr);

  // 3. Discover node adjancencies - add edges to Graph
  G.discover_edges(region_labels, width, height);

  // 4. Merge small area nodes until all nodes are minArea or larger
  G.merge_small_area_nodes(min_area);

  // 5. recolor image on new regions
  std::vector<uint8_t> results(4 * static_cast<size_t>(width) *
                               static_cast<size_t>(height));
  auto index = [width](int x, int y) { return y * width + x; };

  for (auto &n : G.get_nodes()) {
    if (n->area() == 0) {
      continue;
    }
    ImageLib::RGBPixel<uint8_t> col = n->color();
    for (auto &[_, p] : n->get_pixels()) {
      size_t idx{4 * static_cast<size_t>(index(p.x, p.y))};
      results[idx] = col.red;
      results[idx + 1] = col.green;
      results[idx + 2] = col.blue;
      results[idx + 3] = data[idx + 3];
    }
  }

  // 6. Contours
  for (auto &n : G.get_nodes()) {
    // for each node collect pixels, convert to binary image, find contours
    if (n->area() == 0) {
      continue;
    }

    /*
       get tight bounding box the encapsulates
       all pixels held by node.
       returns in format xmin, ymin, width, height
       return a binary image - pixel present = 1, pixel absent = 0
       */
    std::array<int, 4> xywh;
    std::vector<uint8_t> binary;

    xywh = n->create_binary_image(binary);

    int xmin = xywh[0];
    int ymin = xywh[1];
    int bw = xywh[2];
    int bh = xywh[3];

    ContoursResult contour_res = contours::find_contours(binary, bw, bh);

    if (draw_contour_borders) {
      visualize_contours(contour_res.contours, results, width, height, xmin,
                         ymin);
    }
  }

  std::memcpy(data, results.data(), results.size());
}
