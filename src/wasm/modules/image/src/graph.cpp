#include "graph.h"
#include "Pixel.h"
#include <algorithm>
#include <iostream>
#include <iterator>
/*
 Graph class - manages Node class
*/

static inline float colorDistance(const ImageLib::RGBPixel<uint8_t> &a,
                                  const ImageLib::RGBPixel<uint8_t> &b) {

  ImageLib::RGBPixel<float> af{static_cast<float>(a.red),
                               static_cast<float>(a.green),
                               static_cast<float>(a.blue)};
  ImageLib::RGBPixel<float> bf{static_cast<float>(b.red),
                               static_cast<float>(b.green),
                               static_cast<float>(b.blue)};
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

void Graph::compute_contours() {
  // ask each Node to compute contours
  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0)
      continue;
    n->compute_contour();
  }

  std::vector<uint8_t> skel_binary(m_width * m_height, 0);

  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0)
      continue;

    ColoredContours *c0 = &n->m_contours;
    for (size_t i = 0; i < c0->contours.size(); ++i) {
      for (auto &p : c0->contours[i]) {
        int px = static_cast<int>(p.x);
        int py = static_cast<int>(p.y);

        skel_binary[py * m_width + px] = 1;
      }
    }
  }

  std::vector<uint8_t> orig(skel_binary.size());
  std::copy(skel_binary.begin(), skel_binary.end(), orig.begin());

  // apply skeletonization
  skeletonize(skel_binary, m_width, m_height);

  // look at which pixels changes
  std::vector<uint8_t> diff(skel_binary.size(), 0);
  for (int i = 0; i < skel_binary.size(); ++i) {
    diff[i] = orig[i] ^ skel_binary[i];
  }

  orig.clear(); // not needed

  // invert
  // std::transform(skel_binary.begin(), skel_binary.end(), skel_binary.begin(),
  // [](uint8_t x){ return 1 - x; });

  for (const Node_ptr &n : get_nodes()) {
    ColoredContours *c0 = &n->m_contours;

    std::vector<uint8_t> node_binary;
    std::array<int32_t, 4> xywh = n->create_binary_image(node_binary);
    int xmin = xywh[0];
    int ymin = xywh[1];
    int bw = xywh[2];
    int bh = xywh[3];
    int padl = 0; // left
    int padr = 0; // right
    int padt = 0; // top
    int padb = 0; // bottom

    // pad by 3 on all sides
    if (xmin > 2) {
      padl = 3;
    } else {
      padl = xmin;
    }
    if ((xmin + bw) < (m_width - 3)) {
      padr = 3;
    } else {
      padr = m_width - xmin - bw;
    }
    if (ymin > 2) {
      padt = 3;
    } else {
      padt = ymin;
    }
    if ((ymin + bh) < (m_height - 3)) {
      padb = 3;
    } else {
      padb = m_height - ymin - bh;
    }

    xmin -= padl;
    ymin -= padt;

    // pad node_binary
    std::vector<uint8_t> node_binary_pad(
        (bw + padl + padr) * (bh + padt + padb), 0);
    for (int y = padt; y < (bh + padt); ++y) {
      for (int x = padl; x < (bw + padl); ++x) {
        node_binary_pad[y * (bw + padl + padr) + x] =
            node_binary[(y - padt) * bw + (x - padl)];
      }
    }

    std::vector<uint8_t> subset((bw + padl + padr) * (bh + padt + padb), 0);
    std::vector<uint8_t> diff_subset((bw + padl + padr) * (bh + padt + padb),
                                     0);
    for (int x = xmin; x < (xmin + bw + padl + padr); ++x) {
      for (int y = ymin; y < (ymin + bh + padt + padb); ++y) {
        subset[(y - ymin) * (bw + padl + padr) + (x - xmin)] =
            skel_binary[y * m_width + x];
        diff_subset[(y - ymin) * (bw + padl + padr) + (x - xmin)] =
            diff[y * m_width + x];
      }
    }

    int bwpad = bw + padl + padr;
    int bhpad = bh + padt + padb;
    // 3x3 (8)
    const int dx[] = {0, 1, 1, 1, 0, -1, -1, -1};
    const int dy[] = {-1, -1, 0, 1, 1, 1, 0, -1};
    // 5x5 edge (16)
    const int dx5[] = {0, 1, 2, 2, 2, 2, 2, 1, 0, -1, -2, -2, -2, -2, -2, -1};
    const int dy5[] = {-2, -2, -2, -1, 0, 1, 2, 2, 2, 2, 2, 1, 0, -1, -2, -2};
    // 7x7 edge (24)
    const int dx7[] = {0, 1,  2,  3,  3,  3,  3,  3,  3,  3,  2,  1,
                       0, -1, -2, -3, -3, -3, -3, -3, -3, -3, -2, -1};
    const int dy7[] = {-3, -3, -3, -3, -2, -1, 0, 1,  2,  3,  3,  3,
                       3,  3,  3,  3,  2,  1,  0, -1, -2, -3, -3, -3};
    // 9x9 edge (32)
    const int dx9[] = {0,  1,  2,  3,  4,  4,  4,  4,  4,  4,  4,
                       4,  4,  3,  2,  1,  0,  -1, -2, -3, -4, -4,
                       -4, -4, -4, -4, -4, -4, -4, -3, -2, -1};
    const int dy9[] = {-4, -4, -4, -4, -4, -3, -2, -1, 0,  1, 2,
                       3,  4,  4,  4,  4,  4,  4,  4,  4,  4, 3,
                       2,  1,  0,  -1, -2, -3, -4, -4, -4, -4};

    std::vector<uint8_t> updated_binary(node_binary_pad.size(), 0);

    // check boundary pixels
    for (int y = 0; y < bhpad; ++y) {
      for (int x = 0; x < bwpad; ++x) {
        uint8_t val = node_binary_pad[y * bwpad + x];
        if (val == 1) {
          // check if this is a boundary pixel.
          bool is_boundary = false;
          for (int k = 0; k < 8; ++k) {
            int nx = x + dx[k];
            int ny = y + dy[k];
            if (node_binary_pad[ny * bwpad + nx] == 0) {
              is_boundary = true;
              break;
            }
          }
          // if it is...
          // if (is_boundary) {
          // check what skel is at this point
          uint8_t skel_val = subset[y * bwpad + x];
          // uint8_t removed = diff_subset[y * bwpad + x];
          if (skel_val == 0) {
            // if (removed == 1) {
            // border has changed - find what changed
            bool found_new = false;
            for (int k = 0; k < 8; ++k) {
              int nx = x + dx[k];
              int ny = y + dy[k];
              nx = std::clamp(nx, 0, bwpad - 1);
              ny = std::clamp(ny, 0, bhpad - 1);
              if ((subset[ny * bwpad + nx] == 1) &
                  (diff_subset[ny * bwpad + nx] == 0)) {
                updated_binary[ny * bwpad + nx] = 1;
                found_new = true;
              }
            }
            // nothing found then fill with ones and keep searching
            if (!found_new) {
              for (int k = 0; k < 8; ++k) {
                int nx = x + dx[k];
                int ny = y + dy[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                updated_binary[ny * bwpad + nx] = 1;
              }
              // search farther
              for (int k = 0; k < 16; ++k) {
                int nx = x + dx5[k];
                int ny = y + dy5[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                if ((subset[ny * bwpad + nx] == 1) &
                    (diff_subset[ny * bwpad + nx] == 0)) {
                  updated_binary[ny * bwpad + nx] = 1;
                  found_new = true;
                }
              }
            }
            if (!found_new) {
              // search farther
              for (int k = 0; k < 16; ++k) {
                int nx = x + dx5[k];
                int ny = y + dy5[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                updated_binary[ny * bwpad + nx] = 1;
              }

              for (int k = 0; k < 24; ++k) {
                int nx = x + dx7[k];
                int ny = y + dy7[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                if ((subset[ny * bwpad + nx] == 1) &
                    (diff_subset[ny * bwpad + nx] == 0)) {
                  updated_binary[ny * bwpad + nx] = 1;
                  found_new = true;
                }
              }
            }
            if (!found_new) {
              // search farther
              for (int k = 0; k < 24; ++k) {
                int nx = x + dx7[k];
                int ny = y + dy7[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                updated_binary[ny * bwpad + nx] = 1;
              }

              for (int k = 0; k < 32; ++k) {
                int nx = x + dx9[k];
                int ny = y + dy9[k];
                nx = std::clamp(nx, 0, bwpad - 1);
                ny = std::clamp(ny, 0, bhpad - 1);
                if ((subset[ny * bwpad + nx] == 1) &
                    (diff_subset[ny * bwpad + nx] == 0)) {
                  updated_binary[ny * bwpad + nx] = 1;
                  found_new = true;
                }
              }
            }
          } // endif (removed == 1)
          // border hasn't changed
          updated_binary[y * bwpad + x] = 1;
        }
      }
    }

    // unpad
    node_binary.clear();
    node_binary.resize(bw * bh, 0);
    for (int y = padt; y < (bh + padt); ++y) {
      for (int x = padl; x < (bw + padl); ++x) {
        node_binary[(y - padt) * bw + (x - padl)] =
            updated_binary[y * (bw + padl + padr) + x];
      }
    }

    // compute contours for adjusted pixels
    xmin += padl;
    ymin += padt;
    ContoursResult contour_res = contours::find_contours(node_binary, bw, bh);

    // overwrite node's contours
    c0->contours.clear();
    c0->hierarchy.clear();
    c0->is_hole.clear();

    auto col = c0->colors.at(0);
    c0->colors.clear();

    for (size_t cidx = 0; cidx < contour_res.contours.size(); ++cidx) {
      auto &contour = contour_res.contours[cidx];
      for (auto &p : contour) {
        p.x += xmin;
        p.y += ymin;
      }

      if (contour_res.is_hole[cidx]) {
        continue;
      }

      c0->contours.push_back(contour);
      c0->hierarchy.push_back(contour_res.hierarchy[cidx]);
      c0->is_hole.push_back(contour_res.is_hole[cidx]);
      c0->colors.push_back(col);
    }
  }

  // check for holes.... why are they even there?
  std::vector<std::vector<Point>> all_contours;
  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0)
      continue;

    ColoredContours *c0 = &n->m_contours;
    for (size_t i = 0; i < c0->contours.size(); ++i) {
      all_contours.push_back(c0->contours[i]);
    }
  }

  contours::packWithBoundaryConstraints(
      all_contours, Rect{0.0f, 0.0f, static_cast<float>(m_width),
                         static_cast<float>(m_height)});

  int j = 0;
  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0)
      continue;

    ColoredContours *c0 = &n->m_contours;
    for (size_t i = 0; i < c0->contours.size(); ++i) {
      std::copy(all_contours[j].begin(), all_contours[j].end(),
                c0->contours[i].begin());
      j++;
    }
  }
  // look at neighbor pairings
  /*std::set<std::pair<int, int>> adjusted_neighbors {};

  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0) continue;

    ColoredContours* c0 = &n->m_contours; //->get_contours();
    // for each neighbor to this node
    // check their contour and adjust contours to just overlap
    for (const auto &neighbor: n->edges()) {
      if (neighbor->area() == 0) continue;

      // check if this neighbor pairing has already been addressed
      std::pair<int, int> id1 = std::make_pair(n->id(), neighbor->id());
      std::pair<int, int> id2 = std::make_pair(neighbor->id(), n->id());
      auto _end{adjusted_neighbors.end()};
      auto _it1{adjusted_neighbors.find(id1)};
      auto _it2{adjusted_neighbors.find(id2)};

      if (_it1 != _end || _it2 != _end) {
        continue;
      }

      ColoredContours* cn = &neighbor->m_contours; // ->get_contours();

      for (size_t i = 0; i < c0->contours.size(); ++i) {

        for (size_t j = 0; j < cn->contours.size(); ++j) {
          // identify tangent contours and stitch to subpixel accuracy
          contours::stitchSmooth(c0->contours[i], cn->contours[j]);
        }
      }

      adjusted_neighbors.insert(id1);

    }
  }*/
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
        // std::sort(neighbors.begin(), neighbors.end(),
        //          [](Node_ptr a, Node_ptr b) { return a->area() < b->area();
        //          });

        // sort by size and color similarity
        std::sort(neighbors.begin(), neighbors.end(),
                  [col](Node_ptr a, Node_ptr b) {
                    float cdista = colorDistance(a->color(), col);
                    float cdistb = colorDistance(b->color(), col);
                    return (static_cast<float>(a->area()) + 10.f * cdista) <
                           (static_cast<float>(b->area()) + 10.f * cdistb);
                  });

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
