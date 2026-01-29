#ifndef NODE_H
#define NODE_H

#include "RGBPixel.h"
#include "contours.h"
#include <array>
#include <cstdint>
#include <memory>
#include <set>
#include <vector>

/*
   Graph and Node classes support conversion of a region divided image into a
graph structure. Each Node represents a region of pixels which tracks the color
and coordinates (RGBXY) of belonging pixels, and its neighbors as edges.

usage:

std::vector<Node_ptr> nodes; // list of all nodes to be tracked

std::unique_ptr<std::vector<RGBXY>> p_ptr =
std::make_unique<std::vector<RGBXY>>(); // vector of pixels belonging to this
region Node_ptr n_ptr = std::make_shared<Node>(<node id>, p_ptr);
nodes.push_back(n_ptr);

Graph manages a collection of nodes. It will take ownership of `nodes`.
A graph is initialized as a list of disconnected nodes.

std::unique_ptr<std::vector<Node_ptr>> node_ptr =
std::make_unique<std::vector<Node_ptr>>(std::move(nodes)); Graph G(node_ptr);

Given a region image, edges are discovered and recorded:
discover_edges(G, region_labels, width, height);

*/

struct XY {
  int32_t x, y;
  std::pair<int32_t, int32_t> xy;
  XY(int32_t x_, int32_t y_): x(x_), y(y_) {
    xy = std::make_pair(x, y);
  };
  bool operator<(const XY& rhs) const
  { return xy < rhs.xy; };
};

struct RGBXY {
  ImageLib::RGBPixel<uint8_t> color;
  XY position;

  RGBXY(uint8_t r, uint8_t g, uint8_t b, int32_t x, int32_t y)
      : color(r, g, b), position{x, y} {}
};

class Node;
typedef std::shared_ptr<Node> Node_ptr;

/*
 *Node represents a region - collection of pixels, and their neighboring regions
 *(edges)
 */

class Node {
protected:
  int32_t m_id;
  std::unique_ptr<std::vector<RGBXY>> m_pixels;
  std::set<Node_ptr> m_edges{};

  // pixels considered for contour tracing but not influencing other
  // node properties such as color
  std::set<XY> m_edge_pixels{};

public:
  inline Node(int32_t id, std::unique_ptr<std::vector<RGBXY>> &pixels)
      : m_id(id), m_pixels(std::move(pixels)) {}

  XY centroid() const;
  ImageLib::RGBPixel<uint8_t> color() const;
  std::array<int32_t, 4> bounding_box_xywh() const;
  std::array<int, 4> create_binary_image(std::vector<uint8_t> &binary) const;

  // keep track of its own contour points
  // only filled in when compute_contour() is called
  ColoredContours m_contours;
  void compute_contour();

  /* access member variables */
  inline int32_t id() const { return m_id; };
  inline size_t area() const { return m_pixels->size(); };
  inline const std::set<Node_ptr> &edges() const { return m_edges; }
  inline size_t num_edges() const { return m_edges.size(); }
  inline const std::vector<RGBXY> &get_pixels() const { return *m_pixels; }
  inline ColoredContours &get_contours() { return m_contours; }

  /* modify member variables */
  void add_pixels(const std::vector<RGBXY> &new_pixels);
  void add_edge_pixel(const XY edge_pixel);
  void clear_edge_pixels();

  void clear_all();

  inline void add_edge(const Node_ptr &node) { m_edges.insert(node); }
  inline void remove_edge(const Node_ptr &node) { m_edges.erase(node); }
  inline void remove_all_edges() { m_edges.clear(); }
};

#endif
