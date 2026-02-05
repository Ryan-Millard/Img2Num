#ifndef GRAPH_H
#define GRAPH_H

#include "node.h"
#include <unordered_map>

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

class Graph {
protected:
  int m_width, m_height;
  std::unique_ptr<std::vector<Node_ptr>> m_nodes;
  std::unordered_map<int32_t, int32_t> m_node_ids;

  void hash_node_ids(void);

public:
  inline Graph(std::unique_ptr<std::vector<Node_ptr>> &nodes, int width,
               int height)
      : m_nodes(std::move(nodes)), m_width(width), m_height(height) {
    hash_node_ids();
  }

  bool add_edge(int32_t node_id1, int32_t node_id2);
  bool merge_nodes(const Node_ptr &node_to_keep,
                   const Node_ptr &node_to_remove);

  void clear_unconnected_nodes();

  inline const std::vector<Node_ptr> &get_nodes() const { return *m_nodes; }

  bool all_areas_bigger_than(int32_t min_area);
  inline const size_t size() { return m_nodes->size(); }

  void discover_edges(const std::vector<int32_t> &region_labels,
                      const int32_t width, const int32_t height);
  void merge_small_area_nodes(const int32_t min_area);
  void compute_contours();
};

#endif
