#include "graph.h"
#include "Pixel.h"
#include <algorithm>
#include <iterator>
#include <map>
#include <iostream>

/*
 Graph class - manages Node class
*/

float distance(const Point& p1, const Point& p2) {
    return std::sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}

// Helper: 2D integer coordinate for map keys
struct Coord {
    int x, y;
    bool operator<(const Coord& other) const {
        return std::tie(x, y) < std::tie(other.x, other.y);
    }
};

// Helper: Normalize a vector
Point normalize(Point p) {
    float len = std::sqrt(p.x * p.x + p.y * p.y);
    if (len == 0) return {0, 0};
    return {p.x / len, p.y / len};
}

// Helper: Calculate Tangent of A at index i using neighbors
Point getTangent(const std::vector<Point>& vec, int i) {
    int n = vec.size();
    if (n < 2) return {0, 0};
    
    // Use previous and next points to determine the "flow" of the line
    int prev = (i == 0) ? 0 : i - 1;
    int next = (i == n - 1) ? n - 1 : i + 1;
    
    return normalize({vec[next].x - vec[prev].x, vec[next].y - vec[prev].y});
}

void stitchIntegerGrid(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    // 1. Spatial Map for Vector B (Unique coordinates assumption)
    std::map<Coord, int> mapB;
    for (size_t i = 0; i < vecB.size(); ++i) {
        // Round to int safe-guards against floating point drift
        mapB[{ (int)std::round(vecB[i].x), (int)std::round(vecB[i].y) }] = i;
    }

    // Store matches to update later: Pairs of (Index A, Index B)
    std::vector<std::pair<int, int>> matches;

    // 2. Iterate Vector A
    for (size_t i = 0; i < vecA.size(); ++i) {
        int ax = (int)std::round(vecA[i].x);
        int ay = (int)std::round(vecA[i].y);
        
        Point tangentA = getTangent(vecA, i);

        int bestB = -1;
        float minTangentProj = std::numeric_limits<float>::max();
        float minDistSq = std::numeric_limits<float>::max();

        // Check 3x3 neighborhood
        bool foundAny = false;
        
        for (int dy = -1; dy <= 1; ++dy) {
            for (int dx = -1; dx <= 1; ++dx) {
                // Skip self-check if vectors effectively overlap
                if (dx == 0 && dy == 0) {
                   if (mapB.count({ax, ay})) { /* overlap handled as valid candidate */ } 
                   else continue;
                }

                auto it = mapB.find({ax + dx, ay + dy});
                if (it != mapB.end()) {
                    foundAny = true;
                    int idxB = it->second;
                    Point pB = vecB[idxB];
                    
                    // Vector from A to candidate B
                    Point dirToB = { pB.x - vecA[i].x, pB.y - vecA[i].y };
                    float dSq = dirToB.x*dirToB.x + dirToB.y*dirToB.y;
                    
                    // Project "Direction to B" onto "Tangent of A"
                    // Ideally, the partner point lies on the Normal, so dot product with Tangent should be 0.
                    // We minimize this projection to find the point "directly across".
                    float proj = std::abs(dirToB.x * tangentA.x + dirToB.y * tangentA.y);

                    // Selection Logic:
                    // Priority 1: Pick point most perpendicular to flow (smallest projection)
                    // Priority 2: If projections are similar (within epsilon), pick closest distance
                    if (proj < minTangentProj - 1e-5) {
                        minTangentProj = proj;
                        minDistSq = dSq;
                        bestB = idxB;
                    } else if (std::abs(proj - minTangentProj) < 1e-5) {
                        if (dSq < minDistSq) {
                            minDistSq = dSq;
                            bestB = idxB;
                        }
                    }
                }
            }
        }

        if (foundAny && bestB != -1) {
            matches.push_back({ (int)i, bestB });
        }
    }

    // 3. Apply Updates (Subpixel averaging)
    // We use a temporary buffer to ensure calculations don't affect subsequent points
    // (though in this specific logic, dependencies are minimal).
    std::vector<Point> newA(vecA.size());
    std::vector<Point> newB(vecB.size());

    std::copy(vecA.begin(), vecA.end(), newA.begin());
    std::copy(vecB.begin(), vecB.end(), newB.begin());

    for (const auto& m : matches) {
        int idxA = m.first;
        int idxB = m.second;

        Point pA = vecA[idxA];
        Point pB = vecB[idxB];

        // Midpoint
        Point mid = { (pA.x + pB.x) / 2.f, (pA.y + pB.y) / 2.f };

        // Snap both to the exact midpoint
        newA[idxA] = mid;
        newB[idxB] = mid;
    }

    std::copy(newA.begin(), newA.end(), vecA.begin());
    std::copy(newB.begin(), newB.end(), vecB.begin());
    
    std::cout << "Stitched " << matches.size() << " pairs.\n";
}

// void nearestContourAlignment(std::vector<Point>& main_contour, std::vector<Point>& neighbor_contour){
//   constexpr float dirs[8][2]{
//     {-1.0f, -1.0f}, // 0
//     {0.0f, -1.0f},  // 1
//     {1.0f, -1.0f},  // 2
//     {-1.0f, 0.0f},  // 3
//     {0.0f, 0.0f},   // 4
//     {1.0f, 0.0f},   // 5
//     {-1.0f, 1.0f},  // 6
//     {0.0f, 1.0f},   // 7
//     {1.0f, 1.0f}    // 8
//   };
//   /*
//   | 0 | 1 | 2 |
//   | 3 | 4 | 5 |
//   | 6 | 7 | 8 |
//   
//   */
// 
//   /*
//   |   |   | x | x |
//   |   | x | o | o |
//   | x | o | o |
//   | y | o |   |
//   */
// 
//   // for each point consider its 3x3 neighborhood
//   // note locations of neighbors from the same contour
//   // and locations of neighors from the neighboring contour
//   // associate with the perpendicular neighboring contour point
//   // compute mid point, apply that mid point to both contours
// 
//   // since contours are ordered the next and previous points are somewhere in the 3x3 neighborhood
//   bool neighbor_exists = false;
//   for (auto &p: main_contour){
//     neighbor_exists = false;
//     int local[9] = {-1};
//     for (int i=0; i < 9; i++){
//       Point pn{p.x + dirs[i][0], p.y + dirs[i][1]};
//       if (i==4){ 
//         local[i] == 1; 
//       }
//       else if ({
//       }
//       else {
//         auto it = std::find(neighbor_contour.begin(), neighbor_contour.end(), pn);
//         if (it != neighbor_contour.end()){
//           neighbor_exists = neighbor_exists | true;
//           
//         }
//     }
//     if (!neighbor_exists) { continue; }
//     else {
// 
//     }
//   }
// 
//   // 2. find best correspondences between src and tgt points
// 
// 
// }

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
    if (n->area() == 0) continue;
    n->compute_contour();
  }

  
  for (const Node_ptr &n : get_nodes()) {
    if (n->area() == 0) continue;

    ColoredContours* c0 = &n->m_contours; //->get_contours();
    // c0.contours -> list of contours

    // for each neighbor to this node
    // check their contour and adjust contours to just overlap
    for (const auto &neighbor: n->edges()) {
      if (neighbor->area() == 0) continue;
      ColoredContours* cn = &neighbor->m_contours; // ->get_contours();

      for (size_t i = 0; i < c0->contours.size(); ++i) {
        for (size_t j = 0; j < cn->contours.size(); ++j) {
          // identify tangent contours and stitch to subpixel accuracy
          stitchIntegerGrid(c0->contours[i], cn->contours[j]);
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
