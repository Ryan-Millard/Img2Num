#include "graph.h"
#include "Pixel.h"
#include <algorithm>
#include <iterator>

/*
 *Graph class - manages Node class
 */

 static inline float colorDistance(const ImageLib::RGBPixel<uint8_t> &a,
                                  const ImageLib::RGBPixel<uint8_t> &b) {
  
  ImageLib::RGBPixel<float> af {
    static_cast<float>(a.red), static_cast<float>(a.green), static_cast<float>(a.blue)
  };
  ImageLib::RGBPixel<float> bf {
    static_cast<float>(b.red), static_cast<float>(b.green), static_cast<float>(b.blue)
  };
  return std::sqrt((af.red - bf.red) * (af.red - bf.red) +
         (af.green - bf.green) * (af.green - bf.green) +
         (af.blue - bf.blue) * (af.blue - bf.blue));
}

/*
 *To quickly search m_nodes (std::vector) for the index of a node id
 *create an std::unordered_map of node id - index pairs
 *indexing time of std::vector by value is O(N)
 *lookup time of std::unordered_map by key is O(log(N))
 */
void Graph::hash_node_ids() {
  for (int32_t i{0}; i < m_nodes->size(); i++) {
    const int32_t key{m_nodes->at(i)->id()};
    m_node_ids[key] = i;
  }
}

bool Graph::all_areas_bigger_than(int32_t min_area) {
  for (auto &n : *m_nodes) {
    if (n->area() < min_area) {
      return false;
    }
  }

  return true;
}

bool Graph::add_edge(int32_t node_id1, int32_t node_id2) {
  auto end_node_ids{m_node_ids.end()};
  auto node1_it{m_node_ids.find(node_id1)};
  auto node2_it{m_node_ids.find(node_id2)};

  if (node1_it == end_node_ids || node2_it == end_node_ids) {
    return false;
  }

  const int32_t idx1{node1_it->second};
  const int32_t idx2{node2_it->second};

  m_nodes->at(idx1)->add_edge(m_nodes->at(idx2));
  m_nodes->at(idx2)->add_edge(m_nodes->at(idx1));
  return true;
}

bool Graph::merge_nodes(const Node_ptr &node_to_keep,
                        const Node_ptr &node_to_remove) {
  auto end_node_ids{m_node_ids.end()};
  auto node1_it{m_node_ids.find(node_to_keep->id())};
  auto node2_it{m_node_ids.find(node_to_remove->id())};

  if (node1_it == end_node_ids || node2_it == end_node_ids) {
    return false;
  }

  const int32_t idx_k{node1_it->second};
  const int32_t idx_r{node2_it->second};

  // transfer edges from node_to_remove to node_to_keep
  for (Node_ptr n : m_nodes->at(idx_r)->edges()) {
    if (n->id() != node_to_keep->id()) {
      // prevents self referencing
      n->remove_edge(node_to_remove);
      n->add_edge(node_to_keep);
      node_to_keep->add_edge(n);
    }
  }

  node_to_keep->add_pixels(node_to_remove->get_pixels());

  node_to_remove->clear_all();

  return true;
}

void Graph::clear_unconnected_nodes() {
  std::vector<Node_ptr> &nodes{*m_nodes};

  nodes.erase(std::remove_if(nodes.begin(), nodes.end(),
                             [](const Node_ptr &n) { return n->area() == 0; }),
              nodes.end());

  hash_node_ids();
}

void Graph::discover_edges(const std::vector<int32_t> &region_labels,
                           const int32_t width, const int32_t height) {
  // Moore 4-connected neighbourhood
  constexpr int8_t dirs[4][2]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

  int32_t rneigh[4];

  for (int32_t y{0}; y < height; ++y) {
    for (int32_t x{0}; x < width; ++x) {
      const int32_t idx{y * width + x};
      const int32_t rid{region_labels[idx]};

      for (int32_t k{0}; k < 4; ++k) {
        const int32_t nx{x + dirs[k][0]};
        const int32_t ny{y + dirs[k][1]};

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          rneigh[k] = region_labels[ny * width + nx];
        } else {
          rneigh[k] = rid; // ignore out-of-bounds
        }
      }

      for (int32_t r : rneigh) {
        if (r != rid) {
          add_edge(rid, r);
        }
      }
    }
  }
}

void Graph::merge_small_area_nodes(const int32_t min_area) {
  int32_t counter{0};
  while (!all_areas_bigger_than(min_area)) {
    for (const Node_ptr &n : get_nodes()) {
      if (n->area() < min_area) {
        std::vector<Node_ptr> neighbors;
        neighbors.reserve(n->num_edges());
        std::copy(n->edges().begin(), n->edges().end(),
                  std::back_inserter(neighbors));

        ImageLib::RGBPixel<uint8_t> col = n->color();
        // Sort by size -> a.area < b.area
        //std::sort(neighbors.begin(), neighbors.end(),
        //          [](Node_ptr a, Node_ptr b) { return a->area() < b->area(); });

        // sort by size and color similarity
        std::sort(neighbors.begin(), neighbors.end(),
                  [col](Node_ptr a, Node_ptr b) {
                    float cdista = colorDistance(a->color(), col);
                    float cdistb = colorDistance(b->color(), col);
                    return (static_cast<float>(a->area()) + 10.f * cdista) < (static_cast<float>(b->area()) + 10.f * cdistb); 
                  }
        );

        int32_t idx{0};
        // find first non-zero area neighbor
        for (Node_ptr &ne : neighbors) {
          if (ne->area() > 0) {
            break;
          }
          ++idx;
        }

        // no valid neighbor found, skip this node
        if (idx >= static_cast<int32_t>(neighbors.size())) {
          continue;
        }

        if (neighbors[idx]->area() >= n->area()) {
          merge_nodes(neighbors[idx], n);
        } else {
          merge_nodes(n, neighbors[idx]);
        }
      }
    }

    clear_unconnected_nodes();
    ++counter;
  }
}
