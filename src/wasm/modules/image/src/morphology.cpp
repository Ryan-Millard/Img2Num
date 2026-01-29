#include "morphology.h"
#include <iostream>

// Helper to access the 1D vector as a 2D grid safely
inline uint8_t getPixel(const std::vector<uint8_t> &img, int w, int h, int x,
                        int y) {
  if (x < 0 || x >= w || y < 0 || y >= h)
    return 0; // Boundary check
  return img[y * w + x];
}

// Sets a pixel (no bounds check needed if logic is correct, but added for
// safety)
inline void setPixel(std::vector<uint8_t> &img, int w, int x, int y,
                     uint8_t val) {
  img[y * w + x] = val;
}

void skeletonize(std::vector<uint8_t> &img, int width, int height) {
  bool pixelRemoved = true;

  // We need a list to store markers because we cannot remove pixels immediately
  // during an iteration (it would affect the calculation for neighbors).
  std::vector<std::pair<int, int>> markers;

  // Relative coordinates for the 8 neighbors in specific order: P2, P3, ...,
  // P9, P2 P9 P2 P3 P8 P1 P4 P7 P6 P5
  const int dx[] = {0, 1, 1, 1, 0, -1, -1, -1};
  const int dy[] = {-1, -1, 0, 1, 1, 1, 0, -1};

  while (pixelRemoved) {
    pixelRemoved = false;

    // --- SUB-ITERATION 1 ---
    markers.clear();
    for (int y = 0; y < height; ++y) {
      for (int x = 0; x < width; ++x) {
        if (getPixel(img, width, height, x, y) != 1)
          continue;

        // Gather 8 neighbors
        // P2..P9 are indices 0..7 in our dx/dy arrays
        uint8_t p[8];
        for (int i = 0; i < 8; ++i) {
          p[i] = getPixel(img, width, height, x + dx[i], y + dy[i]);
        }

        // Condition 1: 2 <= B(P1) <= 6
        // B(P1) = number of non-zero neighbors
        int B = 0;
        for (int i = 0; i < 8; ++i)
          B += p[i];

        // Condition 2: A(P1) = 1
        // A(P1) = number of 0->1 transitions in sequence P2, P3...P9, P2
        int A = 0;
        for (int i = 0; i < 7; ++i) {
          if (p[i] == 0 && p[i + 1] == 1)
            A++;
        }
        if (p[7] == 0 && p[0] == 1)
          A++; // Wrap around P9 -> P2

        // Conditions for Step 1:
        // 3. P2 * P4 * P6 == 0
        // 4. P4 * P6 * P8 == 0
        if (B >= 2 && B <= 6 && A == 1 && (p[0] * p[2] * p[4] == 0) &&
            (p[2] * p[4] * p[6] == 0)) {
          markers.push_back({x, y});
        }
      }
    }

    // Apply deletions for Step 1
    if (!markers.empty()) {
      pixelRemoved = true;
      for (auto &pt : markers)
        setPixel(img, width, pt.first, pt.second, 0);
    }

    // --- SUB-ITERATION 2 ---
    markers.clear();
    for (int y = 0; y < height; ++y) {
      for (int x = 0; x < width; ++x) {
        if (getPixel(img, width, height, x, y) != 1)
          continue;

        uint8_t p[8];
        for (int i = 0; i < 8; ++i) {
          p[i] = getPixel(img, width, height, x + dx[i], y + dy[i]);
        }

        int B = 0;
        for (int i = 0; i < 8; ++i)
          B += p[i];

        int A = 0;
        for (int i = 0; i < 7; ++i) {
          if (p[i] == 0 && p[i + 1] == 1)
            A++;
        }
        if (p[7] == 0 && p[0] == 1)
          A++;

        // Conditions for Step 2:
        // The first two are the same (B and A)
        // The last two change to:
        // 3. P2 * P4 * P8 == 0
        // 4. P2 * P6 * P8 == 0
        if (B >= 2 && B <= 6 && A == 1 && (p[0] * p[2] * p[6] == 0) &&
            (p[0] * p[4] * p[6] == 0)) {
          markers.push_back({x, y});
        }
      }
    }

    // Apply deletions for Step 2
    if (!markers.empty()) {
      pixelRemoved = true;
      for (auto &pt : markers)
        setPixel(img, width, pt.first, pt.second, 0);
    }
  }
}

void convertStaircaseToDiagonal(std::vector<uint8_t> &img, int width, int height) {
  // Helper lambda to get pixel safely (0 if out of bounds)
  auto get = [&](int x, int y) -> bool {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      return img[y * width + x] != 0;
  };

  bool pixelRemoved = true;

  // We loop until no more pixels are removed to handle long staircases 
  // and 2x2 blocks completely.
  while (pixelRemoved) {
      pixelRemoved = false;

      // Iterate over every pixel
      for (int y = 0; y < height; ++y) {
          for (int x = 0; x < width; ++x) {
              // Skip background pixels
              if (img[y * width + x] == 0) continue;

              // Check the 4 orthogonal neighbors
              bool n = get(x, y - 1); // North
              bool s = get(x, y + 1); // South
              bool e = get(x + 1, y); // East
              bool w = get(x - 1, y); // West

              int n4_count = (n ? 1 : 0) + (s ? 1 : 0) + (e ? 1 : 0) + (w ? 1 : 0);

              // A "Staircase Corner" is defined by:
              // 1. Exactly 2 orthogonal neighbors.
              // 2. The neighbors are NOT opposite (i.e., not a straight vertical/horizontal line).
              if (n4_count == 2) {
                  bool isStraight = (n && s) || (e && w);
                  
                  if (!isStraight) {
                      // It is a corner (e.g., North and East).
                      // In 8-connectivity, removing this pixel leaves N and E 
                      // connected diagonally.
                      img[y * width + x] = 0;
                      pixelRemoved = true;
                  }
              }
          }
      }
  }
}

std::vector<uint8_t> analyzeTopology(const std::vector<uint8_t> &skel, int w,
                                     int h) {
  std::vector<uint8_t> map(w * h, 0);

  // 8-Neighbor Order (Clockwise)
  // P9 P2 P3
  // P8 P1 P4
  // P7 P6 P5
  int dx[] = {0, 1, 1, 1, 0, -1, -1, -1};
  int dy[] = {-1, -1, 0, 1, 1, 1, 0, -1};

  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      if (getPixel(skel, w, h, x, y) == 0)
        continue;

      // 1. Get Neighbors in Circular Order
      int p[8];
      for (int k = 0; k < 8; ++k) {
        p[k] = getPixel(skel, w, h, x + dx[k], y + dy[k]) ? 1 : 0;
      }

      // 2. Count Transitions (0 -> 1)
      // This is the Crossing Number / 2
      int transitions = 0;
      for (int k = 0; k < 8; ++k) {
        if (p[k] == 0 && p[(k + 1) % 8] == 1)
          transitions++;
      }

      // 3. Count Total Neighbors (for Endpoint check)
      int neighbors = 0;
      for (int k = 0; k < 8; ++k)
        neighbors += p[k];

      // 4. Classify
      if (neighbors <= 1) {
        map[y * w + x] = 2; // Endpoint (or isolated)
      } else if (transitions >= 3) {
        map[y * w + x] = 3; // Junction (3+ branches)
      } else {
        map[y * w + x] = 1; // Line (Body or Corner)
      }
    }
  }
  return map;
}

// Gaussian Smoothing (Kernel size 5, Sigma 1.0)
// Preserves curves better than simple averaging
void smoothChainGaussian(std::vector<Point> &chain) {
  if (chain.size() < 3)
    return;
  std::vector<Point> smoothed = chain;

  // Standard normalized Gaussian kernel for window 5
  // [0.061, 0.242, 0.394, 0.242, 0.061]
  const float k[] = {0.06136f, 0.24477f, 0.38774f, 0.24477f, 0.06136f};

  int n = chain.size();
  bool isClosed = (std::abs(chain.front().x - chain.back().x) < 0.1 &&
                   std::abs(chain.front().y - chain.back().y) < 0.1);

  for (int i = 0; i < n; ++i) {
    // Skip endpoints if open chain
    if (!isClosed && (i < 2 || i >= n - 2))
      continue;

    float sumX = 0, sumY = 0;
    for (int j = -2; j <= 2; ++j) {
      int idx = i + j;

      // Handle Boundary Conditions
      if (isClosed) {
        idx = (idx + n) % n; // Wrap for loops
      } else {
        idx = std::max(0, std::min(n - 1, idx)); // Clamp for lines
      }

      sumX += chain[idx].x * k[j + 2];
      sumY += chain[idx].y * k[j + 2];
    }
    smoothed[i] = {sumX, sumY};
  }
  chain = smoothed;
}

float distSq(Point a, Point b) {
  return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
}

float perpendicularDistSq(Point p, Point a, Point b) {
  float l2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
  if (l2 == 0)
    return (p.x - a.x) * (p.x - a.x) + (p.y - a.y) * (p.y - a.y);
  float t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = std::max(0.0f, std::min(1.0f, t));
  Point proj = {a.x + t * (b.x - a.x), a.y + t * (b.y - a.y)};
  return (p.x - proj.x) * (p.x - proj.x) + (p.y - proj.y) * (p.y - proj.y);
}

// --- Algorithm: Ramer-Douglas-Peucker (Preserves Corners) ---
// Recursively simplifies a chain. epsilon = max error (pixels).
void ramerDouglasPeucker(const std::vector<Point> &points, float epsilon,
                         std::vector<Point> &out) {
  if (points.size() < 2) {
    out = points;
    return;
  }

  float dmax = 0;
  int index = 0;
  int end = points.size() - 1;

  // Find point furthest from the line segment [Start, End]
  for (int i = 1; i < end; ++i) {
    float d = perpendicularDistSq(points[i], points[0], points[end]);
    if (d > dmax) {
      dmax = d;
      index = i;
    }
  }

  // If max distance > epsilon, split and recurse
  if (dmax > (epsilon * epsilon)) {
    std::vector<Point> res1, res2;
    std::vector<Point> half1(points.begin(), points.begin() + index + 1);
    std::vector<Point> half2(points.begin() + index, points.end());

    ramerDouglasPeucker(half1, epsilon, res1);
    ramerDouglasPeucker(half2, epsilon, res2);

    out.assign(res1.begin(), res1.end() - 1);
    out.insert(out.end(), res2.begin(), res2.end());
  } else {
    out.clear();
    out.push_back(points[0]);
    out.push_back(points[end]);
  }
}

std::vector<std::vector<Point>>
computeSubpixelCenterlines(const std::vector<uint8_t> &skel, int w, int h) {
  auto topology = analyzeTopology(skel, w, h);

  // --- DEBUG: PRINT TOPOLOGY ---
  /*std::cout << "\n--- TOPOLOGY MAP (E=End, J=Junc, +=Line) ---\n";
  for (int y = 0; y < h; ++y) {
      for (int x = 0; x < w; ++x) {
          uint8_t val = topology[y * w + x];
          char c = '.';
          if (val == 1) c = '+';       // Line
          else if (val == 2) c = 'E';  // Endpoint
          else if (val == 3) c = 'J';  // Junction
          std::cout << c;
      }
      std::cout << "\n";
  }
  std::cout << "---------------------------------------------\n\n";
  */

  // 1. CLUSTER JUNCTIONS (Handle pixel blobs)
  std::vector<int> junctionMap(w * h, -1);
  std::vector<Point> junctionCentroids;
  int dx[] = {0, 1, 1, 1, 0, -1, -1, -1};
  int dy[] = {-1, -1, 0, 1, 1, 1, 0, -1};

  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      int idx = y * w + x;
      if (topology[idx] == 3) {
        int jID = junctionCentroids.size();
        junctionMap[idx] = jID;
        junctionCentroids.push_back({(float)x, (float)y});
      }
    }
  }

  // auto isJunction = [&](int idx) { return junctionMap[idx] != -1; };
  auto isJunction = [&](int idx) { return topology[idx] == 3; };
  std::vector<bool> visited(w * h, false);
  std::vector<std::vector<Point>> chains;

  // TRACE HELPER
  auto trace = [&](int sx, int sy, int firstNx = -1, int firstNy = -1) {
    std::vector<Point> chain;

    // Add Start Point
    if (isJunction(sy * w + sx)) {
      chain.push_back(
          {(float)sx, (float)sy}); // junctionCentroids[junctionMap[sy*w+sx]]);
    } else {
      chain.push_back({(float)sx, (float)sy});
      visited[sy * w + sx] = true;
    }

    int cx = sx, cy = sy;

    // Force First Step (Crucial for Junctions)
    if (firstNx != -1) {
      cx = firstNx;
      cy = firstNy;
      if (isJunction(cy * w + cx)) {
        chain.push_back(
            {(float)cx,
             (float)cy}); // junctionCentroids[junctionMap[cy*w+cx]]);
        chains.push_back(chain);
        return;
      }
      chain.push_back({(float)cx, (float)cy});
      visited[cy * w + cx] = true;
    }

    // Trace loop
    while (true) {
      int bestDir = -1;
      std::vector<int> choices(8, 0);
      for (int i = 0; i < 8; ++i) {
        int nx = cx + dx[i], ny = cy + dy[i];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h)
          continue;
        int nIdx = ny * w + nx;
        if (!getPixel(skel, w, h, nx, ny))
          continue;

        // if (isJunction(nIdx)) { bestDir = i; break; } // Hit Junction
        // if (!visited[nIdx] && topology[nIdx] != 3) { bestDir = i; break; } //
        // Hit Line
        if (isJunction(nIdx)) {
          choices[i] = 3;
          continue;
        }
        if (!visited[nIdx] && topology[nIdx] != 3) {
          choices[i] = 1;
          continue;
        }
      }

      // choose a junction over a line
      for (int j = 0; j < choices.size(); ++j) {
        if (choices[j] == 3) {
          // check that this isn't the junction we just came from
          if (isJunction(sy * w + sx)) {
            int nx = cx + dx[j], ny = cy + dy[j];
            int nIdx = ny * w + nx;
            int dist = std::abs(nx - sx) + std::abs(ny - sy);
            if (dist <= 2) {
              continue;
            };
          }
          bestDir = j;
          break;
        }
      }

      if (bestDir == -1) {
        int bestDist = std::numeric_limits<int>::max();
        for (int j = 0; j < choices.size(); ++j) {
          if (choices[j] == 1) {
            int dist = std::abs(dx[j]) + std::abs(dy[j]);
            if (dist < bestDist) {
              bestDir = j;
              bestDist = dist;
            }
          }
        }
      }

      if (bestDir == -1)
        break;
      cx += dx[bestDir];
      cy += dy[bestDir];
      int cIdx = cy * w + cx;

      if (isJunction(cIdx)) {
        chain.push_back(
            {(float)cx, (float)cy}); // junctionCentroids[junctionMap[cIdx]]);
        break;
      } else {
        chain.push_back({(float)cx, (float)cy});
        visited[cIdx] = true;
      }
    }
    if (chain.size() > 1)
      chains.push_back(chain);
  };

  // PASS 1: Endpoints
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      if (topology[y * w + x] == 2 && !visited[y * w + x])
        trace(x, y);
    }
  }

  // PASS 2: Junctions (Explicit Branching)
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      if (isJunction(y * w + x)) {
        for (int i = 0; i < 8; ++i) {
          int nx = x + dx[i], ny = y + dy[i];
          if (nx < 0 || nx >= w || ny < 0 || ny >= h)
            continue;
          // If neighbor is an unvisited LINE, we MUST trace it
          if (getPixel(skel, w, h, nx, ny) && topology[ny * w + nx] == 1 &&
              !visited[ny * w + nx]) {
            trace(x, y, nx, ny);
          }
        }
      }
    }
  }

  // PASS 3: Loops
  for (int y = 0; y < h; ++y) {
    for (int x = 0; x < w; ++x) {
      if (getPixel(skel, w, h, x, y) && !visited[y * w + x] &&
          !isJunction(y * w + x)) {
        trace(x, y);
        if (!chains.empty()) {
          // Close loop geometrically if ends are close
          if (chains.back().size() > 2 &&
              distSq(chains.back().front(), chains.back().back()) < 2.5f) {
            chains.back().push_back(chains.back().front());
          }
        }
      }
    }
  }

  // 4. VECTORIZATION (Ramer-Douglas-Peucker)
  // Replace Gaussian smoothing with RDP to PRESERVE CORNERS
  std::vector<std::vector<Point>> simplifiedChains;
  for (const auto &c : chains) {
    std::vector<Point> simple;
    // Epsilon 1.0 - 1.5 is usually good for pixel art skeletons
    ramerDouglasPeucker(c, 1.5f, simple);
    simplifiedChains.push_back(simple);
  }

  return chains;
}

// Represents a unique junction or endpoint
struct GraphEdge {
  int targetNode;
  int chainIdx;
  bool reverse;
};

struct GraphNode {
  int id;
  Point p;
  std::vector<GraphEdge> adj;
};

float getSignedArea(const std::vector<Point> &poly) {
  float area = 0.0;
  for (size_t i = 0; i < poly.size(); ++i) {
    size_t j = (i + 1) % poly.size();
    area += (poly[i].x * poly[j].y);
    area -= (poly[j].x * poly[i].y);
  }
  return area / 2.0;
}

// Helper: Calculate angle of a vector
float getAngle(Point src, Point dst) {
  return std::atan2(dst.y - src.y, dst.x - src.x);
}

std::vector<std::vector<Point>>
getAtomicRegions(const std::vector<std::vector<Point>> &chains) {
  // 1. Build Graph (Nodes & Adjacency)
  std::vector<GraphNode> nodes;
  float mergeThreshold = 2.0f;

  auto getNodeID = [&](Point p) -> int {
    for (int i = 0; i < nodes.size(); ++i)
      if (distSq(p, nodes[i].p) < mergeThreshold)
        return i;
    nodes.push_back({(int)nodes.size(), p, {}});
    return nodes.back().id;
  };

  // We store edges as Directed Half-Edges in adjacency
  // edge.reverse = true means this half-edge traverses the chain backwards
  for (int i = 0; i < chains.size(); ++i) {
    if (chains[i].empty())
      continue;
    int u = getNodeID(chains[i].front());
    int v = getNodeID(chains[i].back());

    // Add Directed Half-Edges
    // U -> V (uses chain forward)
    nodes[u].adj.push_back({v, i, false});
    // V -> U (uses chain reversed)
    nodes[v].adj.push_back({u, i, true});
  }

  // 2. Prune Spurs (Dead Ends)
  // Faces are only formed by closed circuits.
  std::vector<bool> active(nodes.size(), true);
  bool changed = true;
  while (changed) {
    changed = false;
    for (int i = 0; i < nodes.size(); ++i) {
      if (!active[i])
        continue;
      int deg = 0;
      bool selfLoop = false;
      for (const auto &e : nodes[i].adj) {
        if (active[e.targetNode])
          deg++;
        if (e.targetNode == i)
          selfLoop = true;
      }
      if (deg <= 1 && !selfLoop) {
        active[i] = false;
        changed = true;
      }
    }
  }

  // 3. Sort Neighbors by Angle (Critical for Left-Turn Rule)
  for (auto &node : nodes) {
    if (!active[node.id])
      continue;

    // Pre-calculate angles for sorting
    std::sort(node.adj.begin(), node.adj.end(),
              [&](const GraphEdge &a, const GraphEdge &b) {
                // Determine geometry of the outgoing edge to calculate angle
                // If reverse=false: starts at chain.front (Node U), goes to
                // chain[1] If reverse=true:  starts at chain.back (Node V),
                // goes to chain[N-2]
                Point p1 = node.p;
                Point p2;
                const auto &cA = chains[a.chainIdx];
                const auto &cB = chains[b.chainIdx];

                p2 = a.reverse ? cA[cA.size() - 2] : cA[1];
                float angA = std::atan2(p2.y - p1.y, p2.x - p1.x);

                p2 = b.reverse ? cB[cB.size() - 2] : cB[1];
                float angB = std::atan2(p2.y - p1.y, p2.x - p1.x);

                return angA < angB;
              });
  }

  // 4. Trace Faces (Half-Edge Traversal)
  // We track visited half-edges. Key = "FromID_ToID_ChainIdx"
  // Using a simple set of strings or tuples for visited check
  std::set<std::tuple<int, int, int>> visitedEdges;
  std::vector<std::vector<Point>> regions;

  for (int i = 0; i < nodes.size(); ++i) {
    if (!active[i])
      continue;

    // Try to start a face from every outgoing edge
    for (const auto &startEdge : nodes[i].adj) {
      if (!active[startEdge.targetNode])
        continue;

      // If we already traversed this specific half-edge, skip
      if (visitedEdges.count({i, startEdge.targetNode, startEdge.chainIdx}))
        continue;

      std::vector<Point> polygon;
      int curr = i;
      GraphEdge nextEdge = startEdge;

      // Walk the loop
      bool loopClosed = false;
      int safety = 0;

      while (safety++ < 10000) { // Safety break
        // Mark this half-edge as visited
        visitedEdges.insert({curr, nextEdge.targetNode, nextEdge.chainIdx});

        // 1. Add Geometry
        const auto &c = chains[nextEdge.chainIdx];
        if (nextEdge.reverse) {
          for (auto it = c.rbegin(); it != c.rend() - 1; ++it)
            polygon.push_back(*it);
        } else {
          for (auto it = c.begin(); it != c.end() - 1; ++it)
            polygon.push_back(*it);
        }

        // 2. Move to next node
        int prev = curr;
        curr = nextEdge.targetNode;

        // Check if closed
        if (curr == i) {
          loopClosed = true;
          break;
        }

        // 3. Find the "Left Turn" (Next CCW Edge)
        // We arrived at 'curr' from 'prev'.
        // We need to find the edge going back to 'prev' in curr's sorted
        // list...
        // ...and pick the one immediately AFTER it (cyclic).

        const auto &adj = nodes[curr].adj;
        int incomingIndex = -1;

        // Find the index of the edge that goes BACK to prev
        for (int k = 0; k < adj.size(); ++k) {
          if (adj[k].targetNode == prev &&
              adj[k].chainIdx == nextEdge.chainIdx) {
            incomingIndex = k;
            break;
          }
        }

        if (incomingIndex == -1)
          break; // Should not happen in valid graph

        // "Left Turn" in screen coords (Y-down) usually corresponds to
        // picking the PREVIOUS edge in angular sort order, or NEXT depending on
        // sort direction. Standard CCW traversal on Y-Down: If angles sorted
        // -PI to +PI: The "sharpest left" is the neighbor immediately
        // cyclic-before the incoming edge.
        int outgoingIndex = (incomingIndex - 1 + adj.size()) % adj.size();

        nextEdge = adj[outgoingIndex];

        // If the "next" edge is dead (pruned), we are stuck (shouldn't happen
        // with pruning)
        if (!active[nextEdge.targetNode])
          break;
      }

      if (loopClosed && polygon.size() > 2) {
        // 5. Filter External Boundary
        // In Screen Coords (Y-Down):
        // Clockwise (CW) = Positive Area (Internal Face)
        // Counter-Clockwise (CCW) = Negative Area (External Boundary)
        float area = getSignedArea(polygon);

        // Only keep Positive Area (Internal Regions)
        // Note: If your coords are standard Cartesian (Y-Up), invert this
        // check.
        if (area > 10.0) { // Epsilon 1.0 to filter degenerate loops
          regions.push_back(polygon);
        }
      }
    }
  }

  for (int i = 0; i < regions.size(); ++i) {
    float area = getSignedArea(regions[i]);
    std::cout << "Region " << i << ": Area = " << area << "\n";
  }

  return regions;
}