
#include "contours.h"
#include <iostream>

namespace contours {

// 8-neighborhood, clockwise order starting from "right" (dx=+1,dy=0).
// (y increases downward)
static constexpr int DX[8] = {+1, +1, 0, -1, -1, -1, 0, +1};
static constexpr int DY[8] = {0, +1, +1, +1, 0, -1, -1, -1};

// Map (dy,dx) to direction index in [0..7]
static inline int dirIndex(int dy, int dx) {
  if (dy == 0 && dx == 1)
    return 0;
  if (dy == 1 && dx == 1)
    return 1;
  if (dy == 1 && dx == 0)
    return 2;
  if (dy == 1 && dx == -1)
    return 3;
  if (dy == 0 && dx == -1)
    return 4;
  if (dy == -1 && dx == -1)
    return 5;
  if (dy == -1 && dx == 0)
    return 6;
  if (dy == -1 && dx == 1)
    return 7;
  return -1; // not a neighbor
}

static inline int dirIndexFromTo(int y, int x, int ny, int nx) {
  return dirIndex(ny - y, nx - x);
}

// Border following (Algorithm 1, steps 3.1..3.5):
// - f is a padded image (0=background; nonzero=object/labels)
// - (sy,sx) is the border start point (nonzero)
// - (py,px) is the "previous" neighbor used to define search direction (usually
// a 0-pixel)
// - nbd is the new border label
// Returns the contour as points in *unpadded* coordinates (x-1,y-1).
static std::vector<Point> traceBorder(std::vector<int> &f, int paddedW, int sy,
                                      int sx, int py, int px, int nbd) {
  auto set = [&](int y, int x) -> int & { return f[y * paddedW + x]; };
  auto get = [&](int y, int x) -> int { return f[y * paddedW + x]; };

  std::vector<Point> pts;

  // (3.1) Find first nonzero neighbor around (sy,sx), scanning clockwise from
  // (py,px)
  const int dStart = dirIndexFromTo(sy, sx, py, px);
  if (dStart < 0) {
    throw std::runtime_error(
        "traceBorder: invalid previous neighbor (not adjacent).");
  }

  int y1 = 0, x1 = 0;
  bool found = false;
  for (int t = 0; t < 8; ++t) {
    int d = (dStart + t) & 7; // clockwise
    int ny = sy + DY[d], nx = sx + DX[d];
    if (get(ny, nx) != 0) {
      y1 = ny;
      x1 = nx;
      found = true;
      break;
    }
  }

  // If isolated pixel: set f(sy,sx) = -NBD and return single-point contour
  if (!found) {
    set(sy, sx) = -nbd;
    pts.push_back(Point{static_cast<float>(sx - 1), static_cast<float>(sy - 1)});
    return pts;
  }

  // (3.2)
  int y2 = y1, x2 = x1; // previous border pixel
  int y3 = sy, x3 = sx; // current border pixel
  const int firstY = y1, firstX = x1;

  while (true) {
    // (3.3) Search CCW around (y3,x3), starting from "next after (y2,x2) in CCW
    // order"
    const int dPrev = dirIndexFromTo(y3, x3, y2, x2);
    if (dPrev < 0) {
      throw std::runtime_error("traceBorder: broken neighbor chain.");
    }

    const int d0 = (dPrev + 7) & 7; // one step CCW from dPrev
    bool rightZeroExamined = false;
    int y4 = y3, x4 = x3; // next border pixel (to be found)

    for (int t = 0; t < 8; ++t) {
      int d = (d0 - t) & 7; // scan CCW (decrement index)
      int ny = y3 + DY[d], nx = x3 + DX[d];

      // (3.4a) depends on whether pixel to the right (dx=+1,dy=0 => dir 0)
      // was examined during (3.3) and was a 0-pixel
      if (d == 0 && get(ny, nx) == 0) {
        rightZeroExamined = true;
      }

      if (get(ny, nx) != 0) {
        y4 = ny;
        x4 = nx;
        break;
      }
    }

    // (3.4) Marking policy
    if (rightZeroExamined) {
      set(y3, x3) = -nbd;
    } else {
      if (set(y3, x3) == 1) {
        set(y3, x3) = nbd;
      }
    }

    // Record current point in unpadded coordinates
    pts.push_back(Point{static_cast<float>(x3 - 1), static_cast<float>(y3 - 1)});

    // (3.5) Termination check
    if (y4 == sy && x4 == sx && y3 == firstY && x3 == firstX) {
      break;
    }

    // Advance
    y2 = y3;
    x2 = x3;
    y3 = y4;
    x3 = x4;
  }

  return pts;
}

ContoursResult find_contours(const std::vector<uint8_t> &binary, int width,
                             int height) {
  if (width <= 0 || height <= 0) {
    return {};
  }
  if ((int)binary.size() != width * height) {
    throw std::invalid_argument("binary.size() must be width*height");
  }

  // Pad image with a 1-pixel 0-frame
  const int paddedW = width + 2;
  const int paddedH = height + 2;
  std::vector<int> f(
      static_cast<std::size_t>(paddedW) * static_cast<std::size_t>(paddedH), 0);

  auto set = [&](int y, int x) -> int & { return f[y * paddedW + x]; };
  auto get = [&](int y, int x) -> int { return f[y * paddedW + x]; };

  for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
      set(y + 1, x + 1) = (binary[y * width + x] != 0) ? 1 : 0;
    }
  }

  // Border node info stored by border id (NBD). ID=1 is the frame (special hole
  // border).
  struct NodeInfo {
    bool is_hole = false;
    int parent_id = 0;         // parent border id
    std::vector<Point> points; // contour points (unpadded coords)
    bool used = false;
  };

  int nbd = 1;
  std::vector<NodeInfo> nodes(2);
  nodes[1].is_hole = true; // frame is treated as a hole border
  nodes[1].parent_id = 1;  // self-parent for convenience
  nodes[1].used = true;

  // Raster scan (Algorithm 1, step 1..4)
  for (int y = 1; y <= height; ++y) {
    int lnbd = 1; // reset each row

    for (int x = 1; x <= width; ++x) {
      int fij = get(y, x);
      if (fij == 0)
        continue; // Algorithm processes only fij != 0

      bool startBorder = false;
      bool isHole = false;
      int py = 0, px = 0;

      // (1a) Outer border start: fij==1 and left is 0
      if (fij == 1 && get(y, x - 1) == 0) {
        ++nbd;
        startBorder = true;
        isHole = false;
        py = y;
        px = x - 1;
      }
      // (1b) Hole border start: fij>=1 and right is 0
      else if (fij >= 1 && get(y, x + 1) == 0) {
        ++nbd;
        startBorder = true;
        isHole = true;
        py = y;
        px = x + 1;

        // LNBD <- fij if fij > 1 (per Appendix I)
        if (fij > 1) {
          lnbd = fij;
        }
      }

      if (startBorder) {
        if ((int)nodes.size() <= nbd)
          nodes.resize(nbd + 1);

        nodes[nbd].is_hole = isHole;
        nodes[nbd].used = true;

        // (2) Decide parent using Table 1:
        // If types match -> parent(B)=parent(B'), else parent(B)=B'
        // where B' is border with id LNBD.
        const bool bprimeIsHole = nodes[lnbd].is_hole;
        const int parent_id =
            (isHole == bprimeIsHole) ? nodes[lnbd].parent_id : lnbd;
        nodes[nbd].parent_id = parent_id;

        // (3) Follow border and mark pixels with +/-NBD
        nodes[nbd].points = traceBorder(f, paddedW, y, x, py, px, nbd);
      }

      // (4) Update LNBD if fij != 1 (note fij may have changed after tracing)
      if (get(y, x) != 1) {
        lnbd = std::abs(get(y, x));
      }
    }
  }

  // Convert from border ids (2..nbd) to compact 0-based contour indices (frame
  // excluded)
  std::vector<int> idToIdx(nbd + 1, -1);
  ContoursResult out;

  out.contours.reserve(std::max(0, nbd - 1));
  out.hierarchy.reserve(std::max(0, nbd - 1));
  out.is_hole.reserve(std::max(0, nbd - 1));

  for (int id = 2; id <= nbd; ++id) {
    if (!nodes[id].used)
      continue;
    idToIdx[id] = (int)out.contours.size();
    out.contours.push_back(nodes[id].points);
    out.is_hole.push_back(nodes[id].is_hole);
    out.hierarchy.push_back({-1, -1, -1, -1});
  }

  // Fill parent index
  for (int id = 2; id <= nbd; ++id) {
    if (!nodes[id].used)
      continue;
    const int idx = idToIdx[id];
    const int pid = nodes[id].parent_id;
    out.hierarchy[idx][3] = (pid <= 1) ? -1 : idToIdx[pid]; // parent
  }

  // Build child/sibling links (first_child, next, prev)
  std::vector<int> lastChild(out.contours.size(), -1);

  for (int i = 0; i < (int)out.contours.size(); ++i) {
    int p = out.hierarchy[i][3];
    if (p < 0)
      continue;

    if (out.hierarchy[p][2] == -1) {
      out.hierarchy[p][2] = i; // first_child
      lastChild[p] = i;
    } else {
      int last = lastChild[p];
      out.hierarchy[last][0] = i; // next sibling
      out.hierarchy[i][1] = last; // prev sibling
      lastChild[p] = i;
    }
  }

  return out;
}


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

struct MatchCandidate {
    int idxA;
    int idxB;
    double alignmentError; // Projection onto tangent (lower is better)
    double distSq;         // Euclidean distance squared (lower is better)

    // Sorting: Primary = Alignment (geometry), Secondary = Distance
    bool operator<(const MatchCandidate& other) const {
        if (std::abs(alignmentError - other.alignmentError) > 1e-6) {
            return alignmentError < other.alignmentError;
        }
        return distSq < other.distSq;
    }
};

Point getSmoothedTangent(const std::vector<Point>& vec, int i) {
    int n = vec.size();
    if (n < 2) return {0, 0};

    float sumX = 0, sumY = 0;
    int count = 0;

    // Look at previous 2 and next 2 points
    for (int offset = -2; offset <= 2; ++offset) {
        if (offset == 0) continue; // Skip self
        int idx = i + offset;
        
        // Handle boundaries (clamp or skip? skipping maintains direction better)
        if (idx >= 0 && idx < n) {
            // Add vector from i to neighbor
            // We flip the sign for previous points so all vectors point "forward"
            float sign = (offset > 0) ? 1.0 : -1.0;
            sumX += (vec[idx].x - vec[i].x) * sign;
            sumY += (vec[idx].y - vec[i].y) * sign;
            count++;
        }
    }
    
    return normalize({sumX, sumY});
}

void stitchUnique(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    // 1. Index Vector B for O(1) spatial lookup
    std::map<Coord, int> mapB;
    for (size_t i = 0; i < vecB.size(); ++i) {
        mapB[{ (int)std::round(vecB[i].x), (int)std::round(vecB[i].y) }] = i;
    }

    // 2. Gather ALL possible valid connections (not just best per point)
    std::vector<MatchCandidate> allCandidates;
    allCandidates.reserve(vecA.size() * 3); // Approximate reservation

    for (size_t i = 0; i < vecA.size(); ++i) {
        int ax = (int)std::round(vecA[i].x);
        int ay = (int)std::round(vecA[i].y);
        
        Point tangentA = getTangent(vecA, i);

        // Search 3x3 Grid
        for (int dy = -1; dy <= 1; ++dy) {
            for (int dx = -1; dx <= 1; ++dx) {
                // If the points are literally on top of each other (0,0 offset),
                // we consider that a candidate too.
                
                auto it = mapB.find({ax + dx, ay + dy});
                if (it != mapB.end()) {
                    int idxB = it->second;
                    Point pB = vecB[idxB];
                    
                    // Score this candidate
                    // Metric: How perpendicular is the jump to the flow of the line?
                    Point dirToB = { pB.x - vecA[i].x, pB.y - vecA[i].y };
                    float dSq = dirToB.x*dirToB.x + dirToB.y*dirToB.y;
                    
                    // Projection error (0.0 means perfectly perpendicular/normal match)
                    float projError = std::abs(dirToB.x * tangentA.x + dirToB.y * tangentA.y);
                    
                    allCandidates.push_back({ (int)i, idxB, projError, dSq });
                }
            }
        }
    }

    // 3. Sort candidates globally (Best matches first)
    std::sort(allCandidates.begin(), allCandidates.end());

    // 4. Resolve Matches (Greedy selection on sorted list)
    std::vector<bool> usedA(vecA.size(), false);
    std::vector<bool> usedB(vecB.size(), false);
    std::vector<std::pair<int, int>> finalMatches;

    for (const auto& cand : allCandidates) {
        // If neither point has been used yet, accept this match
        if (!usedA[cand.idxA] && !usedB[cand.idxB]) {
            usedA[cand.idxA] = true;
            usedB[cand.idxB] = true;
            finalMatches.push_back({ cand.idxA, cand.idxB });
        }
    }

    // 5. Apply Adjustments (Subpixel Averaging)
    std::vector<Point> newA = vecA;
    std::vector<Point> newB = vecB;

    for (const auto& pair : finalMatches) {
        int idxA = pair.first;
        int idxB = pair.second;

        Point pA = vecA[idxA];
        Point pB = vecB[idxB];

        // Midpoint
        Point mid = { (pA.x + pB.x) / 2.f, (pA.y + pB.y) / 2.f };

        newA[idxA] = mid;
        newB[idxB] = mid;
    }

    vecA = newA;
    vecB = newB;

    std::cout << "Stitched " << finalMatches.size() << " unique pairs.\n";
}

float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}
// Calculate the closest point on the segment V -> W from point P
// Returns {ClosestPoint, DistanceSquared}
std::pair<Point, float> getClosestPointOnSegment(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return {v, distSq(p, v)};

    // Project p onto line v-w
    // t is the parameterized distance along the line (0.0 to 1.0)
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    
    // Clamp to segment
    t = std::max(0.0f, std::min(1.0f, t));
    
    Point projection = { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
    return { projection, distSq(p, projection) };
}

void stitchSmooth(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    // 1. Map Vector B indices to Grid (Optimization)
    // We map a coordinate to the INDEX in vector B
    std::map<Coord, int> mapB;
    for (size_t i = 0; i < vecB.size(); ++i) {
        mapB[{ (int)std::round(vecB[i].x), (int)std::round(vecB[i].y) }] = i;
    }

    // We store the calculated "Target Positions" here.
    // We do NOT update in place immediately, or the math for the next point will be wrong.
    struct Update {
        int index;
        Point newPos;
    };
    std::vector<Update> updatesA;
    std::vector<Update> updatesB;

    // --- Process Vector A (Snap to B's Geometry) ---
    for (size_t i = 0; i < vecA.size(); ++i) {
        int ax = (int)std::round(vecA[i].x);
        int ay = (int)std::round(vecA[i].y);
        
        float minDst = std::numeric_limits<float>::max();
        Point bestTarget = vecA[i];
        bool foundMatch = false;

        // Search 3x3 Neighborhood
        for (int dy = -1; dy <= 1; ++dy) {
            for (int dx = -1; dx <= 1; ++dx) {
                auto it = mapB.find({ax + dx, ay + dy});
                if (it != mapB.end()) {
                    int bIdx = it->second;

                    // CHECK FORWARD SEGMENT: B[bIdx] -> B[bIdx+1]
                    if (bIdx < (int)vecB.size() - 1) {
                        auto res = getClosestPointOnSegment(vecA[i], vecB[bIdx], vecB[bIdx+1]);
                        if (res.second < minDst) {
                            minDst = res.second;
                            bestTarget = res.first;
                            foundMatch = true;
                        }
                    }
                    
                    // CHECK BACKWARD SEGMENT: B[bIdx-1] -> B[bIdx]
                    if (bIdx > 0) {
                        auto res = getClosestPointOnSegment(vecA[i], vecB[bIdx-1], vecB[bIdx]);
                        if (res.second < minDst) {
                            minDst = res.second;
                            bestTarget = res.first;
                            foundMatch = true;
                        }
                    }
                }
            }
        }

        if (foundMatch) {
            // Move A to the midpoint between itself and the closest spot on B's line
            Point mid = { (vecA[i].x + bestTarget.x) / 2.f, (vecA[i].y + bestTarget.y) / 2.f };
            updatesA.push_back({ (int)i, mid });
        }
    }

    // --- Process Vector B (Snap to A's Geometry) ---
    // (We need a map for A now to do the reverse)
    std::map<Coord, int> mapA;
    for (size_t i = 0; i < vecA.size(); ++i) {
        mapA[{ (int)std::round(vecA[i].x), (int)std::round(vecA[i].y) }] = i;
    }

    for (size_t i = 0; i < vecB.size(); ++i) {
        int bx = (int)std::round(vecB[i].x);
        int by = (int)std::round(vecB[i].y);
        
        float minDst = std::numeric_limits<float>::max();
        Point bestTarget = vecB[i];
        bool foundMatch = false;

        for (int dy = -1; dy <= 1; ++dy) {
            for (int dx = -1; dx <= 1; ++dx) {
                auto it = mapA.find({bx + dx, by + dy});
                if (it != mapA.end()) {
                    int aIdx = it->second;

                    // Check Forward Segment A
                    if (aIdx < (int)vecA.size() - 1) {
                        auto res = getClosestPointOnSegment(vecB[i], vecA[aIdx], vecA[aIdx+1]);
                        if (res.second < minDst) {
                            minDst = res.second;
                            bestTarget = res.first;
                            foundMatch = true;
                        }
                    }
                    // Check Backward Segment A
                    if (aIdx > 0) {
                        auto res = getClosestPointOnSegment(vecB[i], vecA[aIdx-1], vecA[aIdx]);
                        if (res.second < minDst) {
                            minDst = res.second;
                            bestTarget = res.first;
                            foundMatch = true;
                        }
                    }
                }
            }
        }

        if (foundMatch) {
            Point mid = { (vecB[i].x + bestTarget.x) / 2.0f, (vecB[i].y + bestTarget.y) / 2.0f };
            updatesB.push_back({ (int)i, mid });
        }
    }

    if ((updatesA.size() == 0) | (updatesB.size() == 0)) { return; }

    // --- Apply Updates ---
    for (const auto& u : updatesA) vecA[u.index] = u.newPos;
    for (const auto& u : updatesB) vecB[u.index] = u.newPos;

    // --- OPTIONAL FINAL POLISH: Laplacian Smooth ---
    // This removes any remaining high-frequency noise from the seam
    // Only run this on the points that were actually touched/updated
    // Formula: P_i = 0.25*P_prev + 0.5*P_curr + 0.25*P_next
    
    auto smoothVector = [](std::vector<Point>& pts, const std::vector<Update>& updates) {
        std::vector<Point> original = pts;
        for (const auto& u : updates) {
            int i = u.index;
            if (i > 0 && i < (int)pts.size() - 1) {
                pts[i].x = 0.25f * original[i-1].x + 0.5f * original[i].x + 0.25f * original[i+1].x;
                pts[i].y = 0.25f * original[i-1].y + 0.5f * original[i].y + 0.25f * original[i+1].y;
            }
        }
    };

    auto laplacianSmooth = [](std::vector<Point>& pts, const std::vector<Update>& updates) {
        std::vector<Point> original = pts;
        for (const auto& u : updates) {
            int i = u.index;
            if (i > 0 && i < (int)pts.size() - 1) {
                // Heavier weight on self (0.6) to preserve shape, but smooth noise (0.2 neighbors)
                pts[i].x = 0.2f * original[i-1].x + 0.6f * original[i].x + 0.2f * original[i+1].x;
                pts[i].y = 0.2f * original[i-1].y + 0.6f * original[i].y + 0.2f * original[i+1].y;
            }
        }
    };

    //laplacianSmooth(vecA, updatesA);
    //laplacianSmooth(vecB, updatesB);
    
    smoothVector(vecA, updatesA);
    smoothVector(vecB, updatesB);

    std::cout << "Smoothly stitched " << updatesA.size() << " pts on A and " << updatesB.size() << " pts on B.\n";
}

} // namespace contours
