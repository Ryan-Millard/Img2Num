
#include "contours.h"
#include <algorithm>
#include <cmath>
#include <iterator>
#include <map>
#include <set>
#include <utility>

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
    pts.push_back(
        Point{static_cast<float>(sx - 1), static_cast<float>(sy - 1)});
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
    pts.push_back(
        Point{static_cast<float>(x3 - 1), static_cast<float>(y3 - 1)});

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

// Helper: 2D integer coordinate for map keys
struct Coord {
  int x, y;
  bool operator<(const Coord &other) const {
    return std::tie(x, y) < std::tie(other.x, other.y);
  }
};

// Helper: Normalize a vector
Point normalize(Point p) {
  float len = std::sqrt(p.x * p.x + p.y * p.y);
  if (len == 0)
    return {0, 0};
  return {p.x / len, p.y / len};
}

// Helper: Calculate Tangent of A at index i using neighbors
Point getTangent(const std::vector<Point> &vec, int i) {
  int n = vec.size();
  if (n < 2)
    return {0, 0};

  // Use previous and next points to determine the "flow" of the line
  int prev = (i == 0) ? 0 : i - 1;
  int next = (i == n - 1) ? n - 1 : i + 1;

  return normalize(vec[next] - vec[prev]);
}

// Calculate the closest point on the segment V -> W from point P
// Returns {ClosestPoint, DistanceSquared}
std::pair<Point, float> getClosestPointOnSegment(Point p, Point v, Point w) {
  float l2 = Point::distSq(v, w);
  if (l2 == 0.0)
    return {v, Point::distSq(p, v)};

  // Project p onto line v-w
  // t is the parameterized distance along the line (0.0 to 1.0)
  float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

  // Clamp to segment
  t = std::max(0.0f, std::min(1.0f, t));

  Point projection = {v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)};
  return {projection, Point::distSq(p, projection)};
}

// Identifies a specific point: {ContourIndex, PointIndex}
struct PointID {
  int cIdx;
  int pIdx;
};

/**
 * @brief Computes a smoothed target point using a local quadratic
 * Savitzky-Golay filter.
 *
 * This function smooths a point in a sequence of 2D points by fitting a
 * quadratic polynomial to a 5-point window (if possible) and evaluating it at
 * the center. Essentially, it is a weighted local average where the reference
 * point has the largest weight and neighbors have progressively smaller weights
 * the farther they are from the reference.
 *
 * For points near the boundaries (indices 0, 1, n-2, n-1), where a full 5-point
 * window is not available, a 3-point linear smoothing is applied instead.
 *
 * The 5-point quadratic filter uses the following coefficients:
 *   [-3, 12, 17, 12, -3] / 35
 * which preserves local peaks and slopes while reducing noise.
 *
 * @param pts A vector of 2D points (Point struct with x, y floats) to smooth.
 * @param i   The index of the point to smooth.
 * @return    The smoothed Point at index i.
 *
 * @note The function assumes pts has at least 3 points for linear smoothing and
 *       at least 5 points for quadratic smoothing.
 */

Point getQuadraticTarget(const std::vector<Point> &pts, int i) {
  int n{static_cast<int>(pts.size())};
  // Endpoints cannot be smoothed - return as-is
  if (i <= 0 || i >= n - 1) {
    return pts[i];
  }

  // 1. BOUNDARY FALLBACK:
  // If we are too close to the end (indices 1 or n-2), we don't have 5 points.
  // Fall back to standard Linear Laplacian (0.25, 0.5, 0.25).
  if (i < 2 || i >= n - 2) {
    Point prev{pts[i - 1]};
    Point curr{pts[i]};
    Point next{pts[i + 1]};
    return 0.25f * prev + 0.5f * curr + 0.25f * next;
  }

  // 2. QUADRATIC FILTER (Savitzky-Golay Window 5, Degree 2):
  // Coefficients: [-3, 12, 17, 12, -3] / 35
  // This fits a local parabola and evaluates it at the center.
  const Point &p2L{pts[i - 2]}; // 2 Left
  const Point &p1L{pts[i - 1]}; // 1 Left
  const Point &p{pts[i]};       // Center
  const Point &p1R{pts[i + 1]}; // 1 Right
  const Point &p2R{pts[i + 2]}; // 2 Right

  return (-3.0f * p2L + 12.0f * p1L + 17.0f * p + 12.0f * p1R - 3.0f * p2R) /
         35.0f;
}

void coupledSmooth(std::vector<Point> &contourA, std::vector<Point> &contourB) {

  std::vector<std::vector<Point>> contours = {contourA, contourB};
  // 1. Build Spatial Grid for O(1) partner lookup
  std::map<Coord, std::vector<PointID>> grid;
  for (int c = 0; c < 2; ++c) {
    for (int p = 0; p < (int)contours[c].size(); ++p) {
      grid[{(int)std::round(contours[c][p].x),
            (int)std::round(contours[c][p].y)}]
          .push_back({c, p});
    }
  }

  std::vector<std::vector<Point>> targetPos = {contourA, contourB};

  // Increased radius slightly to ensure we catch partners even on curves
  float pairRadiusSq = 2.0 * 2.0;

  for (int c = 0; c < 2; ++c) {
    // Skip endpoints (p=0 and p=last are usually locked anchors)
    for (int p = 1; p < (int)contours[c].size() - 1; ++p) {

      Point myPos = contours[c][p];

      // --- STEP A: Calculate My Ideal Position (Quadratic) ---
      Point myTarget = getQuadraticTarget(contours[c], p);

      // --- STEP B: Find Partners & Calculate Their Ideal Positions ---
      Point sumPartnerTargets = {0, 0};
      int partnerCount = 0;

      int gx = (int)std::round(myPos.x);
      int gy = (int)std::round(myPos.y);

      // 3x3 Neighbor Search
      for (int dy = -2; dy <= 2; ++dy) {
        for (int dx = -2; dx <= 2; ++dx) {
          auto it = grid.find({gx + dx, gy + dy});
          if (it == grid.end())
            continue;

          for (const auto &neighbor : it->second) {
            if (neighbor.cIdx == c)
              continue; // Ignore self

            Point otherPos = contours[neighbor.cIdx][neighbor.pIdx];

            // If close enough to be a "Partner"
            if (Point::distSq(myPos, otherPos) < pairRadiusSq) {

              // Check if partner is constrained
              int op = neighbor.pIdx;
              const auto &otherContour = contours[neighbor.cIdx];

              Point oTarget;
              if (op > 0 && op < (int)otherContour.size() - 1) {

                // Partner is free: Calculate THEIR Quadratic Target
                oTarget = getQuadraticTarget(otherContour, op);
              } else {
                // Partner is locked: They want to stay put
                oTarget = otherPos;
              }

              sumPartnerTargets += oTarget;
              partnerCount++;
            }
          }
        }
      }

      // --- STEP C: Consensus Averaging ---
      // "I want to be a parabola" vs "My partner wants to be a parabola"
      // We average the two perfect quadratic fits.
      if (partnerCount > 0) {
        targetPos[c][p] = (myTarget + sumPartnerTargets) / (1.0 + partnerCount);
      } else {
        targetPos[c][p] = myTarget;
      }
    }
  }

  std::copy(targetPos[0].begin(), targetPos[0].end(), contourA.begin());
  std::copy(targetPos[1].begin(), targetPos[1].end(), contourB.begin());
}

void stitch_smooth(std::vector<Point> &vecA, std::vector<Point> &vecB) {
  // 1. Map Vector B indices to Grid (Optimization)
  // We map a coordinate to the INDEX in vector B
  std::map<Coord, int> mapB;
  for (size_t i = 0; i < vecB.size(); ++i) {
    mapB[{(int)std::round(vecB[i].x), (int)std::round(vecB[i].y)}] = i;
  }

  // We store the calculated "Target Positions" here.
  // We do NOT update in place immediately, or the math for the next point will
  // be wrong.
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
            auto res =
                getClosestPointOnSegment(vecA[i], vecB[bIdx], vecB[bIdx + 1]);
            if (res.second < minDst) {
              minDst = res.second;
              bestTarget = res.first;
              foundMatch = true;
            }
          }

          // CHECK BACKWARD SEGMENT: B[bIdx-1] -> B[bIdx]
          if (bIdx > 0) {
            auto res =
                getClosestPointOnSegment(vecA[i], vecB[bIdx - 1], vecB[bIdx]);
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
      Point mid = (vecA[i] + bestTarget) * 0.5f;
      updatesA.push_back({(int)i, mid});
    }
  }

  // --- Process Vector B (Snap to A's Geometry) ---
  // (We need a map for A now to do the reverse)
  std::map<Coord, int> mapA;
  for (size_t i = 0; i < vecA.size(); ++i) {
    mapA[{(int)std::round(vecA[i].x), (int)std::round(vecA[i].y)}] = i;
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
            auto res =
                getClosestPointOnSegment(vecB[i], vecA[aIdx], vecA[aIdx + 1]);
            if (res.second < minDst) {
              minDst = res.second;
              bestTarget = res.first;
              foundMatch = true;
            }
          }
          // Check Backward Segment A
          if (aIdx > 0) {
            auto res =
                getClosestPointOnSegment(vecB[i], vecA[aIdx - 1], vecA[aIdx]);
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
      Point mid = (vecB[i] + bestTarget) * 0.5f;
      updatesB.push_back({(int)i, mid});
    }
  }

  if ((updatesA.size() == 0) | (updatesB.size() == 0)) {
    return;
  }

  // --- Apply Updates ---
  for (const auto &u : updatesA)
    vecA[u.index] = u.newPos;
  for (const auto &u : updatesB)
    vecB[u.index] = u.newPos;

  // --- OPTIONAL FINAL POLISH: Laplacian Smooth ---
  // This removes any remaining high-frequency noise from the seam
  // Only run this on the points that were actually touched/updated
  // Formula: P_i = 0.25*P_prev + 0.5*P_curr + 0.25*P_next

  auto smoothVector = [](std::vector<Point> &pts,
                         const std::vector<Update> &updates) {
    std::vector<Point> original = pts;
    for (const auto &u : updates) {
      int i = u.index;
      if (i > 0 && i < (int)pts.size() - 1) {
        pts[i] = 0.25f * original[i - 1] + 0.5f * original[i] +
                 0.25f * original[i + 1];
      }
    }
  };

  auto laplacianSmooth = [](std::vector<Point> &pts,
                            const std::vector<Update> &updates) {
    std::vector<Point> original = pts;
    for (const auto &u : updates) {
      int i = u.index;
      if (i > 0 && i < (int)pts.size() - 1) {
        // Heavier weight on self (0.6) to preserve shape, but smooth noise (0.2
        // neighbors)
        pts[i] = 0.2f * original[i - 1] + 0.6f * original[i] +
                 0.2f * original[i + 1];
      }
    }
  };

  smoothVector(vecA, updatesA);
  smoothVector(vecB, updatesB);
}

// Project p onto segment v-w. Returns closest point.
Point getClosestPoint(Point p, Point v, Point w) {
  float l2 = Point::distSq(v, w);
  if (l2 == 0.0f)
    return v;

  float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  // Allow slight extension (0.01) to help corners "kiss"
  t = std::max(-0.1f, std::min(1.1f, t));

  return {v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)};
}

// --- Step 1: Boundary Locking ---
// Returns a mask: true = Locked (On Boundary), false = Free to move
std::vector<std::vector<bool>>
createBoundaryMask(const std::vector<std::vector<Point>> &contours,
                   Rect bounds) {
  std::vector<std::vector<bool>> locked(contours.size());
  float eps = 0.1; // Tolerance for "on the boundary"

  for (size_t c = 0; c < contours.size(); ++c) {
    locked[c].resize(contours[c].size(), false);
    for (size_t p = 0; p < contours[c].size(); ++p) {
      Point pt = contours[c][p];
      // Check Left, Right, Top, Bottom
      if (std::abs(pt.x - bounds.x) < eps ||
          std::abs(pt.x - (bounds.x + bounds.width - 1.0f)) < eps ||
          std::abs(pt.y - bounds.y) < eps ||
          std::abs(pt.y - (bounds.y + bounds.height - 1.0f)) < eps) {

        locked[c][p] = true;
      }
    }
  }
  return locked;
}

// --- Corner Detection (Feature Preservation) ---
std::vector<bool> detectCorners(const std::vector<Point> &pts,
                                float angleThresholdDeg = 150.0) {
  std::vector<bool> isCorner(pts.size(), false);
  if (pts.size() < 3)
    return isCorner;
  float threshold = std::cos(angleThresholdDeg * M_PI / 180.0f);

  for (size_t i = 1; i < pts.size() - 1; ++i) {
    Point v1 = normalize(pts[i] - pts[i - 1]);
    Point v2 = normalize(pts[i + 1] - pts[i]);
    if (v1.x * v2.x + v1.y * v2.y < threshold)
      isCorner[i] = true;
  }
  // Endpoints are corners
  isCorner[0] = true;
  isCorner.back() = true;
  return isCorner;
}

// --- Selective Smoothing ---
void selectiveSmooth(std::vector<Point> &pts,
                     const std::vector<bool> &isLocked) {
  std::vector<Point> original = pts;
  for (size_t i = 1; i < pts.size() - 1; ++i) {
    // DO NOT move if it's a Corner OR if it's Locked on the boundary
    if (isLocked[i])
      continue;

    pts[i] =
        0.25f * original[i - 1] + 0.5f * original[i] + 0.25f * original[i + 1];
  }
}

void coupledSmooth(std::vector<std::vector<Point>> &contours,
                   const std::vector<std::vector<bool>> &lockedMasks,
                   float pairRadiusSq = 2.25f) {

  SavitzkyGolay sg(2, 2); // radius, polynomial order

  // first fit
  std::vector<std::vector<Point>> smoothedContours;
  for (int c = 0; c < (int)contours.size(); ++c) {
    std::vector<Point> sc = sg.filter_wrap(contours[c]);
    smoothedContours.push_back(sc);
  }

  // 1. Build Spatial Grid to find partners quickly
  std::map<Coord, std::vector<PointID>> grid;
  for (int c = 0; c < (int)contours.size(); ++c) {
    for (int p = 0; p < (int)contours[c].size(); ++p) {
      grid[{static_cast<int>(contours[c][p].x),
            static_cast<int>(contours[c][p].y)}]
          .push_back({c, p});
    }
  }

  // We calculate ALL targets before applying any updates to maintain stability
  std::vector<std::vector<Point>> targetPos = contours;
  // float pairRadiusSq = 1.5f * 1.5f; // Radius to define "Connected/Paired"

  for (int c = 0; c < (int)contours.size(); ++c) {
    for (int p = 1; p < (int)contours[c].size() - 1; ++p) {
      // SKIP Constraints
      if (lockedMasks[c][p])
        continue;

      Point myPos = contours[c][p];
      Point prev = contours[c][p - 1];
      Point next = contours[c][p + 1];

      // 1. Calculate My Laplacian Target (Where I want to go to be smooth)
      Point myTarget = smoothedContours[c][p];

      // 2. Find Partners in OTHER contours
      Point sumPartnerTargets = {0, 0};
      int partnerCount = 0;

      int gx{static_cast<int>(myPos.x)};
      int gy{static_cast<int>(myPos.y)};

      // Check 3x3 grid
      for (int dy = -1; dy <= 1; ++dy) {
        for (int dx = -1; dx <= 1; ++dx) {
          auto it = grid.find({gx + dx, gy + dy});
          if (it == grid.end())
            continue;

          for (const auto &neighbor : it->second) {
            if (neighbor.cIdx == c)
              continue; // Ignore self

            Point otherPos = contours[neighbor.cIdx][neighbor.pIdx];
            if (Point::distSq(myPos, otherPos) < pairRadiusSq) {
              // Found a partner!
              // Calculate where the PARTNER wants to go
              // (We need safe access to partner's neighbors)
              const auto &otherContour = contours[neighbor.cIdx];
              int op = neighbor.pIdx;

              // Only calculate partner target if they are not constrained
              if (op > 0 && op < (int)otherContour.size() - 1 &&
                  // !cornerMasks[neighbor.cIdx][op] &&
                  !lockedMasks[neighbor.cIdx][op]) {

                Point oPrev = otherContour[op - 1];
                Point oNext = otherContour[op + 1];

                Point oTarget = smoothedContours[neighbor.cIdx][op];

                sumPartnerTargets += oTarget;
                partnerCount++;
              } else {
                // If partner is constrained (e.g. corner),
                // we should probably snap to THEM, not smooth them.
                // For simplicity, we treat their current pos as their target.
                sumPartnerTargets += otherPos;
                partnerCount++;
              }
            }
          }
        }
      }

      // 3. Average "My Desire" with "Partners' Desires"
      if (partnerCount > 0) {
        targetPos[c][p] =
            (myTarget + sumPartnerTargets) / (1.0f + partnerCount);
      } else {
        // No partners, just smooth myself
        targetPos[c][p] = myTarget;
      }
    }
  }

  contours = targetPos;
}

void coupled_smooth(std::vector<std::vector<Point>> &contours, Rect bounds) {
  auto lockedMasks = createBoundaryMask(contours, bounds);
  coupledSmooth(contours, lockedMasks, 1.0f);
}

// --- Main Solver ---
void pack_with_boundary_constraints(std::vector<std::vector<Point>> &contours,
                                    Rect bounds, int iterations) {

  // 1. Identify Locked Points (Boundary Constraint)
  auto lockedMasks = createBoundaryMask(contours, bounds);

  // 2. Identify Feature Corners (Shape Constraint)
  // std::vector<std::vector<bool>> cornerMasks;
  // for (const auto& c : contours) cornerMasks.push_back(detectCorners(c));

  constexpr float radiusSq = 3.0f * 3.0f; // Search radius

  for (int iter = 0; iter < iterations; ++iter) {

    // Build Grid
    std::map<Coord, std::vector<PointID>> grid;
    for (int c = 0; c < (int)contours.size(); ++c) {
      for (int p = 0; p < (int)contours[c].size(); ++p) {
        grid[{static_cast<int>(contours[c][p].x),
              static_cast<int>(contours[c][p].y)}]
            .push_back({c, p});
      }
    }

    std::vector<std::vector<Point>> nextContours = contours;

    // Apply Forces
    for (int c = 0; c < (int)contours.size(); ++c) {
      for (int p = 0; p < (int)contours[c].size(); ++p) {

        // CRITICAL CHECK: If on boundary, skip all movement logic
        if (lockedMasks[c][p])
          continue;

        Point currentPos = contours[c][p];
        Point sumTargets = {0, 0};
        int matchCount = 0;

        // Scan Neighborhood
        int gx = static_cast<int>(currentPos.x);
        int gy = static_cast<int>(currentPos.y);

        for (int dy = -1; dy <= 1; ++dy) {
          for (int dx = -1; dx <= 1; ++dx) {
            auto it = grid.find({gx + dx, gy + dy});
            if (it == grid.end())
              continue;

            for (const auto &neighbor : it->second) {
              if (neighbor.cIdx == c)
                continue;
              const auto &other = contours[neighbor.cIdx];
              int idxB = neighbor.pIdx;

              auto checkSeg = [&](int s, int e) {
                Point t = getClosestPoint(currentPos, other[s], other[e]);
                if (Point::distSq(currentPos, t) < radiusSq) {
                  sumTargets += t;
                  matchCount++;
                }
              };
              if (idxB < (int)other.size() - 1)
                checkSeg(idxB, idxB + 1);
              if (idxB > 0)
                checkSeg(idxB - 1, idxB);
            }
          }
        }

        if (matchCount > 0) {
          float stiffness{1.5f};
          nextContours[c][p] =
              (sumTargets + currentPos * stiffness) / (matchCount + stiffness);
        }
      }
    }

    contours = nextContours;
  }
}

} // namespace contours
