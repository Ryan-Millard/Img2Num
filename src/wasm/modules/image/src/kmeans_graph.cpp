// TODO: The kmeans algorithm actually ignores the values of alpha where it
// should actually be taken into account.

#include "kmeans_graph.h"
#include "contours.h"
#include "graph.h"
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <memory>
#include <queue>
#include <random>
#include <set>
#include <sstream>
#include <vector>

/* Flood fill */
int flood_fill(std::vector<int32_t> &label_array,
               std::vector<int32_t> &region_array, const uint8_t *color_array,
               int x, int y, int target_value, int label_value, size_t width,
               size_t height, std::unique_ptr<std::vector<RGBXY>> &out_pixels) {
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

void region_labeling(const uint8_t *data, std::vector<int32_t> &labels,
                     std::vector<int32_t> &regions, int width, int height,
                     std::vector<Node_ptr> &nodes) {
  auto index = [width](int x, int y) { return y * width + x; };

  regions.resize(static_cast<size_t>(height) * static_cast<size_t>(width), -1);
  int r_lbl = -1;

  for (int i = 0; i < width; i++) {
    for (int j = 0; j < height; j++) {

      int label{labels[size_t(index(i, j))]};
      int rlab{regions[size_t(index(i, j))]};

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
                        ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> &results,
                        int width, int height, int xmin = 0, int ymin = 0) {
  auto index = [width](int x, int y) { return y * width + x; };

  // Random generator for colors
  static std::mt19937 rng(std::random_device{}());
  static std::uniform_int_distribution<int32_t> dist(0, 255);
  for (const auto &c : contours) {
    ImageLib::RGBAPixel<uint8_t> rand_color{
        static_cast<uint8_t>(dist(rng)), static_cast<uint8_t>(dist(rng)),
        static_cast<uint8_t>(dist(rng)), 255};

    for (const auto &p : c) {
      int32_t _x{static_cast<int32_t>(p.x) + xmin};
      int32_t _y{static_cast<int32_t>(p.y) + ymin};

      // Ensure within bounds
      if (_x < 0 || _x >= width || _y < 0 || _y >= height)
        continue;

      results(_x, _y) = rand_color;
    }
  }
}

std::string contourToSVGPath(const std::vector<Point> &contour) {
  if (contour.empty())
    return "";

  std::ostringstream path;
  path << std::fixed << std::setprecision(2);

  // Move to the first point
  path << "M " << contour[0].x << " " << contour[0].y << " ";

  // Draw lines to the remaining points
  for (size_t i = 1; i < contour.size(); ++i) {
    path << "L " << contour[i].x << " " << contour[i].y << " ";
  }

  // Close the path
  path << "Z";
  return path.str();
}

std::string contoursResultToSVG(const ColoredContours &result, const int width,
                                const int height) {
  std::ostringstream svg;
  svg << "<svg xmlns=\"http://www.w3.org/2000/svg\" fill-rule=\"evenodd\" "
         "width=\""
      << width << "\" height=\"" << height << "\">\n";

  for (size_t i = 0; i < result.contours.size(); ++i) {
    std::string pathData = contourToSVGPath(result.contours[i]);

    const auto &px = result.colors[i];
    std::ostringstream oss;
    oss << "#" << std::hex << std::uppercase << std::setw(2)
        << std::setfill('0') << static_cast<int>(px.red) << std::setw(2)
        << std::setfill('0') << static_cast<int>(px.green) << std::setw(2)
        << std::setfill('0') << static_cast<int>(px.blue);

    // You can optionally style holes differently or rely on fill-rule
    svg << "  <path d=\"" << pathData << "\" fill=\"" << oss.str() << "\" />\n";
  }

  svg << "</svg>\n";
  return svg.str();
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
char *kmeans_clustering_graph(uint8_t *data, int32_t *labels, const int width,
                              const int height, const int min_area,
                              const bool draw_contour_borders) {
  const int32_t num_pixels{width * height};
  std::vector<int32_t> kmeans_labels{labels, labels + num_pixels};
  std::vector<int32_t> region_labels;

  // 1. enumerate regions and convert to Nodes
  std::vector<Node_ptr> nodes;
  region_labeling(data, kmeans_labels, region_labels, width, height, nodes);

  // 2. initialize Graph from all Nodes
  std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
  Graph G(node_ptr, width, height);

  // 3. Discover node adjacencies - add edges to Graph
  G.discover_edges(region_labels, width, height);

  // 4. Merge small area nodes until all nodes are minArea or larger
  G.merge_small_area_nodes(min_area);

  // 5. recolor image on new regions
  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> results{width, height};
  for (auto &n : G.get_nodes()) {
    if (n->area() == 0)
      continue;

    auto [r, g, b] = n->color();
    for (auto &[_, p] : n->get_pixels()) {
      results(p.x, p.y) = {r, g, b};
    }
  }

  // 6. Contours
  // graph will manage computing contours
  G.compute_contours();

  // accumulate all contours for svg export
  ColoredContours all_contours;
  for (auto &n : G.get_nodes()) {
    if (n->area() == 0)
      continue;
    ColoredContours node_contours = n->get_contours();
    for (auto &c : node_contours.contours) {
      all_contours.contours.push_back(c);
    }
    for (auto &c : node_contours.hierarchy) {
      all_contours.hierarchy.push_back(c);
    }
    for (bool b : node_contours.is_hole) {
      all_contours.is_hole.push_back(b);
    }
    for (auto &c : node_contours.colors) {
      all_contours.colors.push_back(c);
    }
  }

  // 7. Copy recolored image back
  const auto &modified = results.getData();
  std::memcpy(data, modified.data(),
              modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));

  // 8. Return SVG if requested
  if (!draw_contour_borders) {
    std::string svg = contoursResultToSVG(all_contours, width, height);
    // allocate char* dynamically
    char *res_svg = new char[svg.size() + 1];
    std::memcpy(res_svg, svg.c_str(), svg.size() + 1);
    return res_svg;
  }

  return nullptr; // no SVG
}
