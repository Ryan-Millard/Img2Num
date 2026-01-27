
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

namespace contours2 {

struct PointID {
    int cIdx;
    int pIdx;
};

struct Coord {
    int x, y;
    bool operator<(const Coord& other) const {
        return std::tie(x, y) < std::tie(other.x, other.y);
    }
};

// --- Math Helpers ---
float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

Point normalize(Point p) {
    float len = std::sqrt(p.x*p.x + p.y*p.y);
    if (len == 0) return {0,0};
    return {p.x/len, p.y/len};
}

Point getClosestPoint(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return v;
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(-0.2f, std::min(1.2f, t)); // Increased extension to catch tips
    return { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
}

// --- Masking Helpers ---

// 1. Boundary Lock: Prevent moving outer frame
std::vector<std::vector<bool>> createBoundaryMask(const std::vector<std::vector<Point>>& contours, Rect bounds) {
    std::vector<std::vector<bool>> locked(contours.size());
    float eps = 0.1f;
    for (size_t c = 0; c < contours.size(); ++c) {
        locked[c].resize(contours[c].size(), false);
        for (size_t p = 0; p < contours[c].size(); ++p) {
            Point pt = contours[c][p];
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

// 2. Corner Detection: Identify sharp bends
std::vector<bool> detectCorners(const std::vector<Point>& pts, float angleThresholdDeg = 150.0) {
    std::vector<bool> isCorner(pts.size(), false);
    if (pts.size() < 3) return isCorner;
    float threshold = std::cos(angleThresholdDeg * M_PI / 180.0);
    for (size_t i = 1; i < pts.size() - 1; ++i) {
        Point v1 = normalize({pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y});
        Point v2 = normalize({pts[i+1].x - pts[i].x, pts[i+1].y - pts[i].y});
        if (v1.x * v2.x + v1.y * v2.y < threshold) isCorner[i] = true;
    }
    // Endpoints are technically corners, but handled specially
    isCorner[0] = true; 
    isCorner.back() = true;
    return isCorner;
}

// 3. Junction Detection: THE FIX
// If a "Corner" is very close to another contour, it is a JUNCTION TIP.
// We must UNLOCK it so it can smooth/merge with the other tips.
std::vector<std::vector<bool>> refineCornerMasks(
    const std::vector<std::vector<Point>>& contours, 
    const std::vector<std::vector<bool>>& initialCorners) 
{
    std::vector<std::vector<bool>> finalMasks = initialCorners;
    float junctionRadiusSq = 3.0 * 3.0; // Check proximity

    // Build grid for fast neighbor lookup
    std::map<Coord, std::vector<PointID>> grid;
    for (int c = 0; c < (int)contours.size(); ++c) {
        for (int p = 0; p < (int)contours[c].size(); ++p) {
            grid[{ (int)std::round(contours[c][p].x), (int)std::round(contours[c][p].y) }].push_back({c, p});
        }
    }

    for (int c = 0; c < (int)contours.size(); ++c) {
        for (int p = 0; p < (int)contours[c].size(); ++p) {
            if (!initialCorners[c][p]) continue; // Only check corners

            // Look for neighbors in OTHER contours
            int gx = (int)std::round(contours[c][p].x);
            int gy = (int)std::round(contours[c][p].y);
            bool isJunction = false;

            for (int dy = -1; dy <= 1; ++dy) {
                for (int dx = -1; dx <= 1; ++dx) {
                    auto it = grid.find({gx + dx, gy + dy});
                    if (it == grid.end()) continue;
                    for (const auto& neighbor : it->second) {
                        if (neighbor.cIdx != c) {
                            if (distSq(contours[c][p], contours[neighbor.cIdx][neighbor.pIdx]) < junctionRadiusSq) {
                                isJunction = true;
                                break; 
                            }
                        }
                    }
                    if(isJunction) break;
                }
                if(isJunction) break;
            }

            // If it's a junction, UNPROTECT it. Let it smooth!
            if (isJunction) {
                finalMasks[c][p] = false;
            }
        }
    }
    return finalMasks;
}

// Helper: Get Quadratic Target using 5-point Savitzky-Golay
// Preserves curvature much better than simple averaging
Point getQuadraticTarget(const std::vector<Point>& pts, int i) {
    int n = pts.size();

    // 1. BOUNDARY FALLBACK: 
    // If we are too close to the end (indices 1 or n-2), we don't have 5 points.
    // Fall back to standard Linear Laplacian (0.25, 0.5, 0.25).
    if (i < 2 || i >= n - 2) {
        Point prev = pts[i-1];
        Point curr = pts[i];
        Point next = pts[i+1];
        return { 
            0.25f * prev.x + 0.5f * curr.x + 0.25f * next.x,
            0.25f * prev.y + 0.5f * curr.y + 0.25f * next.y
        };
    }

    // 2. QUADRATIC FILTER (Savitzky-Golay Window 5, Degree 2):
    // Coefficients: [-3, 12, 17, 12, -3] / 35
    // This fits a local parabola and evaluates it at the center.
    const Point& p2L = pts[i-2]; // 2 Left
    const Point& p1L = pts[i-1]; // 1 Left
    const Point& p   = pts[i];   // Center
    const Point& p1R = pts[i+1]; // 1 Right
    const Point& p2R = pts[i+2]; // 2 Right

    float tx = (-3.0f*p2L.x + 12.0f*p1L.x + 17.0f*p.x + 12.0f*p1R.x - 3.0f*p2R.x) / 35.0f;
    float ty = (-3.0f*p2L.y + 12.0f*p1L.y + 17.0f*p.y + 12.0f*p1R.y - 3.0f*p2R.y) / 35.0f;

    return {tx, ty};
}

void coupledSmooth(std::vector<std::vector<Point>>& contours, 
                   const std::vector<std::vector<bool>>& cornerMasks, 
                   const std::vector<std::vector<bool>>& lockedMasks) {
    
    // 1. Build Spatial Grid for O(1) partner lookup
    std::map<Coord, std::vector<PointID>> grid;
    for (int c = 0; c < (int)contours.size(); ++c) {
        for (int p = 0; p < (int)contours[c].size(); ++p) {
            grid[{ (int)std::round(contours[c][p].x), (int)std::round(contours[c][p].y) }].push_back({c, p});
        }
    }

    std::vector<std::vector<Point>> targetPos = contours;
    
    // Increased radius slightly to ensure we catch partners even on curves
    float pairRadiusSq = 2.0 * 2.0; 

    for (int c = 0; c < (int)contours.size(); ++c) {
        // Skip endpoints (p=0 and p=last are usually locked anchors)
        for (int p = 1; p < (int)contours[c].size() - 1; ++p) {
            
            // CONSTRAINTS: Never smooth corners or locked boundary points
            if (cornerMasks[c][p] || lockedMasks[c][p]) continue;

            Point myPos = contours[c][p];

            // --- STEP A: Calculate My Ideal Position (Quadratic) ---
            Point myTarget = getQuadraticTarget(contours[c], p);

            // --- STEP B: Find Partners & Calculate Their Ideal Positions ---
            Point sumPartnerTargets = {0,0};
            int partnerCount = 0;

            int gx = (int)std::round(myPos.x);
            int gy = (int)std::round(myPos.y);

            // 3x3 Neighbor Search
            for (int dy = -1; dy <= 1; ++dy) {
                for (int dx = -1; dx <= 1; ++dx) {
                    auto it = grid.find({gx + dx, gy + dy});
                    if (it == grid.end()) continue;

                    for (const auto& neighbor : it->second) {
                        if (neighbor.cIdx == c) continue; // Ignore self

                        Point otherPos = contours[neighbor.cIdx][neighbor.pIdx];
                        
                        // If close enough to be a "Partner"
                        if (distSq(myPos, otherPos) < pairRadiusSq) {
                            
                            // Check if partner is constrained
                            int op = neighbor.pIdx;
                            const auto& otherContour = contours[neighbor.cIdx];
                            
                            Point oTarget;
                            if (op > 0 && op < (int)otherContour.size() - 1 && 
                                !cornerMasks[neighbor.cIdx][op] && 
                                !lockedMasks[neighbor.cIdx][op]) {
                                
                                // Partner is free: Calculate THEIR Quadratic Target
                                oTarget = getQuadraticTarget(otherContour, op);
                            } else {
                                // Partner is locked: They want to stay put
                                oTarget = otherPos;
                            }

                            sumPartnerTargets.x += oTarget.x;
                            sumPartnerTargets.y += oTarget.y;
                            partnerCount++;
                        }
                    }
                }
            }

            // --- STEP C: Consensus Averaging ---
            // "I want to be a parabola" vs "My partner wants to be a parabola"
            // We average the two perfect quadratic fits.
            if (partnerCount > 0) {
                targetPos[c][p].x = (myTarget.x + sumPartnerTargets.x) / (1.0 + partnerCount);
                targetPos[c][p].y = (myTarget.y + sumPartnerTargets.y) / (1.0 + partnerCount);
            } else {
                targetPos[c][p] = myTarget;
            }
        }
    }

    contours = targetPos;
}

// --- Main Solver ---
void packFinal(std::vector<std::vector<Point>>& contours, Rect bounds, int iterations) {
    
    auto lockedMasks = createBoundaryMask(contours, bounds);
    
    // 1. Initial Corner Detection
    std::vector<std::vector<bool>> initialCorners;
    for (const auto& c : contours) initialCorners.push_back(detectCorners(c));

    // 2. Refine Corners (Unlock Junctions)
    auto cornerMasks = refineCornerMasks(contours, initialCorners);

    float radiusSq = 1.5 * 1.5; // Attraction radius

    for (int iter = 0; iter < iterations; ++iter) {
        
        // --- Phase 1: Attraction (Physics) ---
        std::map<Coord, std::vector<PointID>> grid;
        for (int c = 0; c < (int)contours.size(); ++c) {
            for (int p = 0; p < (int)contours[c].size(); ++p) {
                grid[{ (int)std::round(contours[c][p].x), (int)std::round(contours[c][p].y) }].push_back({c, p});
            }
        }

        std::vector<std::vector<Point>> nextContours = contours;

        for (int c = 0; c < (int)contours.size(); ++c) {
            for (int p = 0; p < (int)contours[c].size(); ++p) {
                if (lockedMasks[c][p]) continue;

                Point currentPos = contours[c][p];
                Point sumTargets = {0, 0};
                int matchCount = 0;
                int gx = (int)std::round(currentPos.x);
                int gy = (int)std::round(currentPos.y);

                for (int dy = -2; dy <= 2; ++dy) { // 7x7 Search for Attraction
                    for (int dx = -2; dx <= 2; ++dx) {
                        auto it = grid.find({gx + dx, gy + dy});
                        if (it == grid.end()) continue;
                        for (const auto& neighbor : it->second) {
                            if (neighbor.cIdx == c) continue;
                            
                            const auto& other = contours[neighbor.cIdx];
                            int idxB = neighbor.pIdx;

                            auto checkSeg = [&](int s, int e) {
                                Point t = getClosestPoint(currentPos, other[s], other[e]);
                                if (distSq(currentPos, t) < radiusSq) {
                                    sumTargets.x += t.x; sumTargets.y += t.y; matchCount++;
                                }
                            };
                            if (idxB < (int)other.size() - 1) checkSeg(idxB, idxB+1);
                            if (idxB > 0) checkSeg(idxB-1, idxB);
                        }
                    }
                }

                if (matchCount > 0) {
                    float stiffness = cornerMasks[c][p] ? 0.5f : 1.5f; // Corners stiff, edges soft
                    nextContours[c][p].x = (sumTargets.x + currentPos.x * stiffness) / (matchCount + stiffness);
                    nextContours[c][p].y = (sumTargets.y + currentPos.y * stiffness) / (matchCount + stiffness);
                }
            }
        }
        contours = nextContours;

        // --- Phase 2: Coupled Smoothing ---
        coupledSmooth(contours, cornerMasks, lockedMasks);
    }

    std::cout << "Packed with Junction Unlocking.\n";
}

// --- Main Solver with TETHERING ---
void packTethered(std::vector<std::vector<Point>>& contours, Rect bounds, int iterations) {
    
    // 1. Store Original Geometry (The "Skeleton")
    std::vector<std::vector<Point>> originalContours = contours;

    auto lockedMasks = createBoundaryMask(contours, bounds);
    std::vector<std::vector<bool>> initialCorners;
    for (const auto& c : contours) initialCorners.push_back(detectCorners(c));
    auto cornerMasks = refineCornerMasks(contours, initialCorners);

    float radiusSq = 1.0f * 1.0f; 
    float MAX_DISPLACEMENT = 4.0f; // Hard Limit: 4 pixels max movement
    float MAX_DISP_SQ = MAX_DISPLACEMENT * MAX_DISPLACEMENT;

    for (int iter = 0; iter < iterations; ++iter) {
        
        // --- Phase 1: Attraction + Tether ---
        std::map<Coord, std::vector<PointID>> grid;
        for (int c = 0; c < (int)contours.size(); ++c) {
            for (int p = 0; p < (int)contours[c].size(); ++p) {
                grid[{ (int)std::round(contours[c][p].x), (int)std::round(contours[c][p].y) }].push_back({c, p});
            }
        }

        std::vector<std::vector<Point>> nextContours = contours;

        for (int c = 0; c < (int)contours.size(); ++c) {
            for (int p = 0; p < (int)contours[c].size(); ++p) {
                if (lockedMasks[c][p]) continue;

                Point currentPos = contours[c][p];
                Point origin = originalContours[c][p]; // Anchor

                Point sumTargets = {0, 0};
                int matchCount = 0;
                int gx = (int)std::round(currentPos.x);
                int gy = (int)std::round(currentPos.y);

                // Attraction from neighbors
                for (int dy = -1; dy <= 1; ++dy) {
                    for (int dx = -1; dx <= 1; ++dx) {
                        auto it = grid.find({gx + dx, gy + dy});
                        if (it == grid.end()) continue;
                        for (const auto& neighbor : it->second) {
                            if (neighbor.cIdx == c) continue;
                            const auto& other = contours[neighbor.cIdx];
                            int idxB = neighbor.pIdx;
                            auto checkSeg = [&](int s, int e) {
                                Point t = getClosestPoint(currentPos, other[s], other[e]);
                                if (distSq(currentPos, t) < radiusSq) {
                                    sumTargets.x += t.x; sumTargets.y += t.y; matchCount++;
                                }
                            };
                            if (idxB < (int)other.size() - 1) checkSeg(idxB, idxB+1);
                            if (idxB > 0) checkSeg(idxB-1, idxB);
                        }
                    }
                }

                if (matchCount > 0) {
                    float stiffness = cornerMasks[c][p] ? 0.8f : 1.2f;
                    Point target = {
                        (sumTargets.x + currentPos.x * stiffness) / (matchCount + stiffness),
                        (sumTargets.y + currentPos.y * stiffness) / (matchCount + stiffness)
                    };
                    
                    // --- TETHER CONSTRAINT ---
                    // Calculate vector from Origin to Proposed Target
                    float dx = target.x - origin.x;
                    float dy = target.y - origin.y;
                    float dSq = dx*dx + dy*dy;

                    // If we exceeded the leash, clamp it
                    if (dSq > MAX_DISP_SQ) {
                        float scale = MAX_DISPLACEMENT / std::sqrt(dSq);
                        target.x = origin.x + dx * scale;
                        target.y = origin.y + dy * scale;
                    }
                    
                    nextContours[c][p] = target;
                }
            }
        }
        contours = nextContours;

        // --- Phase 2: Smooth + Tether Clamp ---
        coupledSmooth(contours, cornerMasks, lockedMasks);

        // Re-enforce Tether after smoothing!
        // (Smoothing might have pushed it out of bounds again)
        for (int c = 0; c < (int)contours.size(); ++c) {
            for (int p = 0; p < (int)contours[c].size(); ++p) {
                if (lockedMasks[c][p]) continue;
                Point origin = originalContours[c][p];
                float dx = contours[c][p].x - origin.x;
                float dy = contours[c][p].y - origin.y;
                float dSq = dx*dx + dy*dy;
                
                if (dSq > MAX_DISP_SQ) {
                    float scale = MAX_DISPLACEMENT / std::sqrt(dSq);
                    contours[c][p].x = origin.x + dx * scale;
                    contours[c][p].y = origin.y + dy * scale;
                }
            }
        }
    }

    std::cout << "Packed with Tether Constraints (Topology Safe).\n";
}

}

namespace contours3{
    // Helper for map keys
// --- Math Helpers ---
float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

float dist(Point a, Point b) {
    return std::sqrt(distSq(a, b));
}

// Project P onto Segment V-W. Returns closest point.
Point getClosestOnSegment(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return v;
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(0.0f, std::min(1.0f, t));
    return { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
}

// --- Step 1: Generate Raw Midline ---
// Scans for the overlapping region and returns the jagged centerline.
std::vector<Point> extractOverlapMidline(const std::vector<Point>& vecA, const std::vector<Point>& vecB, float threshold) {
    std::vector<Point> midline;
    float threshSq = threshold * threshold;

    // Determine the overlapping range indices for A
    // (Simple nearest neighbor search for valid pairs)
    for (const auto& pA : vecA) {
        float minD = std::numeric_limits<float>::max();
        Point bestB = {0,0};
        
        // Find closest point in B (Brute force is fine for small/medium contours)
        // Optimization: In production, use a spatial grid or tracking index.
        bool matchFound = false;
        for (const auto& pB : vecB) {
            float d = distSq(pA, pB);
            if (d < minD) {
                minD = d;
                bestB = pB;
            }
        }

        if (minD < threshSq) {
            // Valid overlap point. Average them.
            midline.push_back({ (pA.x + bestB.x)/2.0f, (pA.y + bestB.y)/2.0f });
        }
    }
    return midline;
}

// --- Step 2: Fit Smooth Spline (Bounded) ---
// We use iterative Gaussian Smoothing to simulate a B-Spline.
// We LOCK the first and last points to satisfy "bounded on end points".
std::vector<Point> fitSmoothSpline(std::vector<Point> points, int iterations = 5) {
    if (points.size() < 3) return points;

    std::vector<Point> buffer = points;
    
    for (int iter = 0; iter < iterations; ++iter) {
        // Skip index 0 and index N-1 (Anchors are Locked)
        for (size_t i = 1; i < points.size() - 1; ++i) {
            // Kernel: 0.25, 0.5, 0.25 (Standard smoothing)
            buffer[i].x = 0.25f * points[i-1].x + 0.5f * points[i].x + 0.25f * points[i+1].x;
            buffer[i].y = 0.25f * points[i-1].y + 0.5f * points[i].y + 0.25f * points[i+1].y;
        }
        points = buffer;
    }
    return points;
}

// --- Step 3: Zipper Projection ---
// Snap points from contour onto the Spline
void snapToSpline(std::vector<Point>& contour, const std::vector<Point>& spline, float threshold) {
    float threshSq = threshold * threshold;

    for (auto& p : contour) {
        float bestDist = std::numeric_limits<float>::max();
        Point bestProj = p;
        bool snapped = false;

        // Find closest spot on the WHOLE spline
        for (size_t i = 0; i < spline.size() - 1; ++i) {
            Point proj = getClosestOnSegment(p, spline[i], spline[i+1]);
            float d = distSq(p, proj);
            
            if (d < bestDist) {
                bestDist = d;
                bestProj = proj;
            }
        }

        // Only move if within the "influence" of the seam
        if (bestDist < threshSq) {
            p = bestProj;
        }
    }
}

void sortPointsSpatially(std::vector<Point>& cloud) {
    if (cloud.size() < 2) return;

    Point start = cloud.front();
    Point end = cloud.back();
    
    // Baseline vector
    float dx = end.x - start.x;
    float dy = end.y - start.y;
    float lenSq = dx*dx + dy*dy;

    // Lambda to calculate "T" (projection progress 0.0 to 1.0)
    auto getProgress = [&](Point p) {
        if (lenSq == 0) return 0.0f;
        return ((p.x - start.x) * dx + (p.y - start.y) * dy) / lenSq;
    };

    std::sort(cloud.begin(), cloud.end(), [&](Point a, Point b) {
        return getProgress(a) < getProgress(b);
    });
}

// --- Main Function ---
void zipperSpline(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    float overlapThreshold = std::sqrt(2.0f); // Distance to consider "touching"

    // 1. Identify the Seam (Raw Midpoints)
    // We get midpoints relative to A, and separately relative to B to ensure density
    std::vector<Point> rawSeamA = extractOverlapMidline(vecA, vecB, overlapThreshold);
    std::vector<Point> rawSeamB = extractOverlapMidline(vecB, vecA, overlapThreshold);

    // Combine and sort/clean (simple concatenation for this demo)
    std::vector<Point> combinedSeam = rawSeamA;
    combinedSeam.insert(combinedSeam.end(), rawSeamB.begin(), rawSeamB.end());
    
    // Sort by X or Y roughly to order the points for the spline? 
    // In a general 2D case, we shouldn't sort by coord.
    // Instead, we usually rely on the order derived from 'vecA'.
    // Let's just use 'rawSeamA' as the driver for the spline topology.
    // if (rawSeamA.size() < 2) return; 
    sortPointsSpatially(combinedSeam);
    // 2. Fit the Spline
    // Smooth the raw midpoints into a clean curve
    std::vector<Point> spline = fitSmoothSpline(combinedSeam, 10); // 10 iterations = very smooth

    // 3. Zipper (Project)
    // Snap both contours to this single mathematical definition
    snapToSpline(vecA, spline, overlapThreshold);
    snapToSpline(vecB, spline, overlapThreshold);

    std::cout << "Zippered " << rawSeamA.size() << " seam points via Spline.\n";
}
}

namespace contours4 {

struct Range {
    int start;
    int end;
    int length() const { return end - start + 1; }
};

float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

float dist(Point a, Point b) {
    return std::sqrt(distSq(a, b));
}

// Distance from Point P to Segment V-W
float distToSegmentSq(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return distSq(p, v);
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(0.0f, std::min(1.0f, t));
    Point projection = { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
    return distSq(p, projection);
}

// Project P onto Segment V-W. Returns closest point.
Point getClosestOnSegment(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return v;
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(0.0f, std::min(1.0f, t));
    return { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
}

std::vector<bool> getContactMask(const std::vector<Point>& source, const std::vector<Point>& target, float threshold) {
    std::vector<bool> mask(source.size(), false);
    float threshSq = threshold * threshold;

    // Optimization: Build a spatial grid if vectors are huge (>10k points).
    // For typical contours, O(N*M) with bounding box checks is sufficient.

    for (size_t i = 0; i < source.size(); ++i) {
        bool close = false;
        
        // Check against every segment in Target
        for (size_t j = 0; j < target.size() - 1; ++j) {
            if (distToSegmentSq(source[i], target[j], target[j+1]) < threshSq) {
                close = true;
                break;
            }
        }
        mask[i] = close;
    }
    return mask;
}

// Convert boolean mask (0011100110) into Ranges ([2-4], [7-8])
void extractRanges(const std::vector<bool>& mask, std::vector<Range>& ranges) {
    if (mask.empty()) return;

    bool insideRange = false;
    int start = -1;

    for (size_t i = 0; i < mask.size(); ++i) {
        if (mask[i] && !insideRange) {
            // Start of a new range
            insideRange = true;
            start = i;
        } else if (!mask[i] && insideRange) {
            // End of current range
            insideRange = false;
            ranges.push_back({start, (int)i - 1});
        }
    }
    
    // Handle edge case where vector ends while inside a range
    if (insideRange) {
        ranges.push_back({start, (int)mask.size() - 1});
    }

    return;
}

// Optional: Merge ranges that are separated by very small gaps (noise filtering)
// e.g., True, True, False, True, True -> True, True, True, True, True
void mergeCloseRanges(std::vector<Range>& ranges, int gapTolerance) {
    if (ranges.size() < 2) return;
    
    std::vector<Range> merged;
    merged.push_back(ranges[0]);

    for (size_t i = 1; i < ranges.size(); ++i) {
        Range& current = merged.back();
        Range& next = ranges[i];

        // If the gap between ranges is small, merge them
        if (next.start - current.end - 1 <= gapTolerance) {
            current.end = next.end;
        } else {
            merged.push_back(next);
        }
    }
    ranges = merged;
}

void findTangentRanges(const std::vector<Point>& vecA, const std::vector<Point>& vecB, std::vector<Range>& rangesA, std::vector<Range>& rangesB, float threshold) {
    
    // 1. Compute Contact Masks
    // (Is A[i] close to B?)
    auto maskA = getContactMask(vecA, vecB, threshold);
    // (Is B[i] close to A?)
    auto maskB = getContactMask(vecB, vecA, threshold);

    // 2. Extract Ranges
    extractRanges(maskA, rangesA);
    extractRanges(maskB, rangesB);

    // 3. Clean up noise (Optional)
    // If we have a 1-pixel gap due to noise, ignore it and treat as one continuous range.
    // mergeCloseRanges(rangesA, 2); 
    // mergeCloseRanges(rangesB, 2);

    // 4. Output Results
    std::cout << "--- Vector A Contact Ranges ---\n";
    if (rangesA.empty()) std::cout << "None.\n";
    for (const auto& r : rangesA) {
        std::cout << "Index [" << r.start << " to " << r.end << "] (Count: " << r.length() << ")\n";
    }

    std::cout << "\n--- Vector B Contact Ranges ---\n";
    if (rangesB.empty()) std::cout << "None.\n";
    for (const auto& r : rangesB) {
        std::cout << "Index [" << r.start << " to " << r.end << "] (Count: " << r.length() << ")\n";
    }
}

struct TangentPair {
    int startA, endA;
    int startB, endB;
};

struct PointIdx {
  float x = 0;
  float y = 0;
  int idx = 0;
};

int getClosestSegmentIndex(Point p, const std::vector<Point>& vec) {
    int bestIdx = -1;
    float minD = std::numeric_limits<float>::max();

    for (size_t i = 0; i < vec.size() - 1; ++i) {
        float d = distToSegmentSq(p, vec[i], vec[i+1]);
        if (d < minD) {
            minD = d;
            bestIdx = i;
        }
    }
    return bestIdx;
}

void findAlignedRanges(const std::vector<Point>& vecA, const std::vector<Point>& vecB, std::vector<TangentPair>& result, float threshSq) {
    
    // 1. Detect Contact Mask on A
    std::vector<bool> contactA(vecA.size(), false);
    for (size_t i = 0; i < vecA.size(); ++i) {
        // Check if A[i] is close to ANY part of B
        // Optimization: In dense scenarios, use the 'getClosestSegmentIndex' logic directly here
        // but for clarity we do a simple check first.
        for (size_t j = 0; j < vecB.size(); ++j) {
            // pixel must be directly in 3x3 neighborbood

            // if (distToSegmentSq(vecA[i], vecB[j], vecB[j+1]) <= threshSq) {
            if (
                (std::abs(vecB[j].x - vecA[i].x) <= 1) &&
                (std::abs(vecB[j].y - vecA[i].y) <= 1)
            )
            {
                contactA[i] = true;
                break;
            }
        }
    }

    // 2. Extract Ranges from A and Project to B
    if (contactA.empty()) return;

    bool inside = false;
    int startA = -1;

    // Lambda to process a completed range on A
    auto processRange = [&](int s, int e) {
        int minB = std::numeric_limits<int>::max();
        int maxB = -1;

        // Sample points in this range on A and map them to B
        // We check every point to ensure we capture the full extent on B
        for (int k = s; k <= e; ++k) {
            int idxB = getClosestSegmentIndex(vecA[k], vecB);
            if (idxB != -1) {
                if (idxB < minB) minB = idxB;
                if (idxB > maxB) maxB = idxB;
            }
        }
        
        // If valid projection found
        if (maxB != -1) {
            // Because 'idxB' represents the segment start, maxB implies segment maxB->maxB+1.
            // We usually want the point range. So range is minB to maxB+1.
            result.push_back({s, e, minB, maxB + 1});
        }
    };

    // Scan the mask
    for (size_t i = 0; i < contactA.size(); ++i) {
        if (contactA[i] && !inside) {
            inside = true;
            startA = i;
        } else if (!contactA[i] && inside) {
            processRange(startA, (int)i - 1);
            inside = false;
        }
    }
    // Handle end of vector
    if (inside) {
        processRange(startA, (int)contactA.size() - 1);
    }

    // 3. (Optional) Merge close ranges
    // Sometimes a single pixel gap in A might split a range. 
    // You can iterate 'result' and merge if result[i].endA is close to result[i+1].startA.

    return;
}

void findAlignedRanges2(const std::vector<Point>& vecA, const std::vector<Point>& vecB, std::vector<TangentPair>& result, float thresholdSq) {
    
    // 1. Detect Contact Mask on A
    std::vector<bool> contactA(vecA.size(), false);
    for (size_t i = 0; i < vecA.size(); ++i) {
        // Simple proximity check
        for (size_t j = 0; j < vecB.size() - 1; ++j) {
            // if (distToSegmentSq(vecA[i], vecB[j], vecB[j+1]) < threshSq) {
            if (
                (std::abs(vecB[j].x - vecA[i].x) <= 1) &&
                (std::abs(vecB[j].y - vecA[i].y) <= 1)
            )
            {
                contactA[i] = true;
                break;
            }
        }
    }

    if (contactA.empty()) return;

    bool inside = false;
    int startA = -1;

    auto processRange = [&](int s, int e) {
        int minB = std::numeric_limits<int>::max();
        int maxB = -1;
        
        // Track indices to determine direction
        int firstValidB = -1;
        int lastValidB = -1;

        // Sample points to find bounds AND orientation
        for (int k = s; k <= e; ++k) {
            int idxB = getClosestSegmentIndex(vecA[k], vecB);
            if (idxB != -1) {
                if (idxB < minB) minB = idxB;
                if (idxB > maxB) maxB = idxB;
                
                // Capture first and last projections
                if (firstValidB == -1) firstValidB = idxB;
                lastValidB = idxB;
            }
        }
        
        if (maxB != -1) {
            // Heuristic: If the start of A maps to a HIGHER index on B 
            // than the end of A, they are running opposite directions.
            bool antiparallel = (firstValidB > lastValidB);
            
            result.push_back({s, e, minB, maxB + 1});//, antiparallel});
        }
    };

    for (size_t i = 0; i < contactA.size(); ++i) {
        if (contactA[i] && !inside) {
            inside = true; startA = i;
        } else if (!contactA[i] && inside) {
            processRange(startA, (int)i - 1);
            inside = false;
        }
    }
    if (inside) processRange(startA, (int)contactA.size() - 1);

    return;
}

std::vector<Point> fitSmoothSpline(std::vector<Point> points, int iterations = 5) {
    if (points.size() < 3) return points;

    std::vector<Point> buffer = points;
    
    for (int iter = 0; iter < iterations; ++iter) {
        // Skip index 0 and index N-1 (Anchors are Locked)
        for (size_t i = 1; i < points.size() - 1; ++i) {
            // Kernel: 0.25, 0.5, 0.25 (Standard smoothing)
            buffer[i].x = 0.25f * points[i-1].x + 0.5f * points[i].x + 0.25f * points[i+1].x;
            buffer[i].y = 0.25f * points[i-1].y + 0.5f * points[i].y + 0.25f * points[i+1].y;
        }
        points = buffer;
    }
    return points;
}

float getPolylineLength(const std::vector<Point>& poly) {
    float len = 0;
    for (size_t i = 1; i < poly.size(); ++i) {
        len += dist(poly[i-1], poly[i]);
    }
    return len;
}

Point samplePolyline(const std::vector<Point>& poly, float t) {
    if (poly.empty()) return {0,0};
    if (t <= 0.0) return poly.front();
    if (t >= 1.0) return poly.back();

    float totalLen = getPolylineLength(poly);
    float targetDist = t * totalLen;
    
    float currentDist = 0;
    for (size_t i = 1; i < poly.size(); ++i) {
        float segLen = dist(poly[i-1], poly[i]);
        if (currentDist + segLen >= targetDist) {
            // Target is inside this segment
            float segT = (targetDist - currentDist) / segLen;
            return { 
                poly[i-1].x + segT * (poly[i].x - poly[i-1].x),
                poly[i-1].y + segT * (poly[i].y - poly[i-1].y)
            };
        }
        currentDist += segLen;
    }
    return poly.back();
}

void snapRangeToSpline(std::vector<Point>& vec, int start, int end, const std::vector<Point>& midSpline) {
    for (int i = start; i <= end; ++i) {
        float bestDist = std::numeric_limits<float>::max();
        Point bestProj = vec[i];

        // Project onto Mid-Spline segments
        for (size_t k = 0; k < midSpline.size() - 1; ++k) {
            Point proj = getClosestOnSegment(vec[i], midSpline[k], midSpline[k+1]);
            float d = distSq(vec[i], proj);
            if (d < bestDist) {
                bestDist = d;
                bestProj = proj;
            }
        }
        vec[i] = bestProj;
    }
}

void zipperSpline(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    float overlapThresholdSq = 2.0f; // Distance to consider "touching"
    // std::vector<Range> rangesA, rangesB;
    // findTangentRanges(vecA, vecB, rangesA, rangesB, overlapThreshold);
    
    std::vector<TangentPair> ranges;
    findAlignedRanges2(vecA, vecB, ranges, overlapThresholdSq);

    //std::vector<std::map<int, int>> indicesPairs; // vector A idx -- vector B idx matches
    //findAlignedRanges3(vecA, vecB, indicesPairs, overlapThresholdSq);

    
    // not overlaps
    if (ranges.size() == 0) { return; }
    
    int samples = 127; // Higher = smoother curve
    std::vector<Point> midSpline;
    midSpline.reserve(samples + 1);

    //lengths should be the same
    std::cout << "Number of tangents: " << ranges.size() << std::endl;
    for (int i=0; i < ranges.size(); ++i) {
        //Range rA = rangesA[i];
        //Range rB = rangesB[i];
        TangentPair r = ranges[i];

        bool reverse = false;

        std::vector<Point> pieceA(vecA.begin() + r.startA, vecA.begin() + r.endA);
        std::vector<Point> pieceB(vecB.begin() + r.startB, vecB.begin() + r.endB);

        if (
            (std::abs(pieceB.front().x - pieceA.front().x) > 1) ||
            (std::abs(pieceB.front().y - pieceA.front().y) > 1)
        ) {
            reverse = true;
            std::reverse(pieceB.begin(), pieceB.end());
        }

        // if still not aligned then continue
        /*if (
            (std::abs(pieceB.front().x - pieceA.front().x) > 1) ||
            (std::abs(pieceB.front().y - pieceA.front().y) > 1) ||
            (std::abs(pieceB.back().x - pieceA.back().x) > 1) ||
            (std::abs(pieceB.back().y - pieceA.back().y) > 1)
        ) { continue; }*/

        std::vector<Point> splineA = fitSmoothSpline(pieceA, 10); 
        std::vector<Point> splineB = fitSmoothSpline(pieceB, 10);

        std::cout << "splineA start: " << splineA.front().x << ", " << splineA.front().y << std::endl;
        std::cout << "splineB start: " << splineB.front().x << ", " << splineB.front().y << std::endl;

        std::cout << "splineA end: " << splineA.back().x << ", " << splineA.back().y << std::endl;
        std::cout << "splineB end: " << splineB.back().x << ", " << splineB.back().y << std::endl;
        
        // zipper the splines
        // 3. Generate MID-SPLINE via Parametric Averaging
        // We resample both curves to a fixed resolution and average them.

        std::cout << "start sampling" << std::endl;
        midSpline.clear();
        for (int j = 0; j <= samples; ++j) {
            float t = (float)j / (float)samples;
            
            Point pA = samplePolyline(splineA, t);
            Point pB = samplePolyline(splineB, t);
            
            midSpline.push_back({ (pA.x + pB.x) / 2.0f, (pA.y + pB.y) / 2.0f });
        }
        
        std::cout << "snap A" << std::endl;
        snapRangeToSpline(vecA, r.startA, r.endA, midSpline);
        if (reverse) {
            std::reverse(midSpline.begin(), midSpline.end());
        }
        std::cout << "snap B" << std::endl;
        snapRangeToSpline(vecB, r.startB, r.endB, midSpline);
    }
}
}

namespace contours5 {

// Start can be > End if the range wraps around (Cyclic)
struct TangentRange {
    int startA, endA;  // Indices on A (may wrap)
    int lengthA;       // Number of points in range A
    bool isAntiparallel; 
    bool isFullLoop;   // True if the contact covers the whole loop
};

// --- Math Helpers ---
float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

float dist(Point a, Point b) {
    return std::sqrt(distSq(a, b));
}

// Project P onto Segment V-W
Point getClosestOnSegment(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return v;
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(0.0f, std::min(1.0f, t));
    return { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
}

// Get distance from P to Segment (index i -> i+1 wrapped)
float distToSegCyclic(Point p, const std::vector<Point>& poly, int i) {
    int next = (i + 1) % poly.size();
    Point proj = getClosestOnSegment(p, poly[i], poly[next]);
    return distSq(p, proj);
}

// Find closest segment index on B for point P (Cyclic safe)
int getClosestIdx(Point p, const std::vector<Point>& vec) {
    int bestI = -1;
    float minD = std::numeric_limits<float>::max();
    for(size_t i=0; i<vec.size(); ++i) {
        float d = distToSegCyclic(p, vec, i);
        if(d < minD) { minD = d; bestI = i; }
    }
    return bestI;
}

// --- Cyclic Helpers ---

// Extract points from 'vec' handling wrapping indices
std::vector<Point> extractCyclicChunk(const std::vector<Point>& vec, int start, int count, bool reverse) {
    std::vector<Point> chunk;
    chunk.reserve(count);
    int n = vec.size();
    
    for (int i = 0; i < count; ++i) {
        int idx = (start + i) % n;
        chunk.push_back(vec[idx]);
    }
    
    if (reverse) {
        std::reverse(chunk.begin(), chunk.end());
    }
    return chunk;
}

// --- Step 1: Detect Ranges (Cyclic Aware) ---
std::vector<TangentRange> findCyclicRanges(const std::vector<Point>& vecA, const std::vector<Point>& vecB, float threshold) {
    std::vector<TangentRange> result;
    float threshSq = threshold * threshold;
    int nA = vecA.size();

    // 1. Create Contact Mask
    std::vector<bool> contact(nA, false);
    int contactCount = 0;
    
    for (int i = 0; i < nA; ++i) {
        // Check proximity to B (Cyclic scan on B)
        // Optimization: For huge B, use a grid. Simple loop used here.
        for (size_t j = 0; j < vecB.size(); ++j) {
            //if (distToSegCyclic(vecA[i], vecB, j) < threshSq) 
            if (
                (std::abs(vecB[j].x - vecA[i].x) <= 1) &&
                (std::abs(vecB[j].y - vecA[i].y) <= 1)
            )
            {
                contact[i] = true;
                contactCount++;
                break;
            }
        }
    }

    if (contactCount == 0) return result;

    // 2. Identify Continuous Segments (handling wrap)
    // If start(0) and end(N-1) are both true, we rotate our search start to the first 'false' 
    // to avoid splitting the group.
    
    int searchOffset = 0;
    if (contact[0] && contact[nA-1] && contactCount < nA) {
        // Find the first non-contact point to start our loop logic
        for (int i = 0; i < nA; ++i) {
            if (!contact[i]) {
                searchOffset = i;
                break;
            }
        }
    }

    bool inside = false;
    int start = -1;

    auto finalizeRange = [&](int s, int e) {
        // Adjust for wrapping indices
        int realStart = (s + nA) % nA;
        int realEnd = (e + nA) % nA;
        
        // Calculate length handling wrap
        int len = (realEnd >= realStart) ? (realEnd - realStart + 1) : (nA - realStart + realEnd + 1);

        // Determine Orientation (Antiparallel Check)
        // We sample Start and End points and check their projection on B
        Point pStart = vecA[realStart];
        Point pEnd   = vecA[realEnd]; // Actually, take a point slightly before end to be safe
        
        int idxB_Start = getClosestIdx(pStart, vecB);
        int idxB_End   = getClosestIdx(pEnd, vecB);
        
        // Heuristic: Shortest path direction on cyclic B
        int nB = vecB.size();
        int forwardDist = (idxB_End - idxB_Start + nB) % nB;
        int backwardDist = (idxB_Start - idxB_End + nB) % nB;
        
        bool isAntiparallel = (backwardDist < forwardDist);
        bool isFullLoop = (len >= nA - 1); // If it covers almost everything

        result.push_back({realStart, realEnd, len, isAntiparallel, isFullLoop});
    };

    // Scan with offset
    for (int i = 0; i < nA; ++i) {
        int idx = (searchOffset + i) % nA;
        if (contact[idx] && !inside) {
            inside = true;
            start = idx;
        } else if (!contact[idx] && inside) {
            // End of range (previous point)
            int end = (idx - 1 + nA) % nA;
            finalizeRange(start, end);
            inside = false;
        }
    }
    
    // If we end while inside, close it
    if (inside) {
        int end = (searchOffset + nA - 1) % nA;
        finalizeRange(start, end);
    }
    
    return result;
}

// --- Spline Helpers ---
std::vector<Point> fitClosedSpline(std::vector<Point> points, int iterations = 5) {
    if (points.size() < 3) return points;
    int n = (int)points.size();
    
    std::vector<Point> buffer = points;
    
    for (int iter = 0; iter < iterations; ++iter) {
        for (int i = 0; i < n; ++i) {
            // Wrap indices modulo N
            int prevIdx = (i - 1 + n) % n;
            int nextIdx = (i + 1) % n;
            
            buffer[i].x = 0.25 * points[prevIdx].x + 0.5 * points[i].x + 0.25 * points[nextIdx].x;
            buffer[i].y = 0.25 * points[prevIdx].y + 0.5 * points[i].y + 0.25 * points[nextIdx].y;
        }
        points = buffer;
    }
    return points;
}

std::vector<Point> fitSmoothSpline(std::vector<Point> points, int iterations = 5) {
    if (points.size() < 3) return points;

    std::vector<Point> buffer = points;
    
    for (int iter = 0; iter < iterations; ++iter) {
        // Skip index 0 and index N-1 (Anchors are Locked)
        for (size_t i = 1; i < points.size() - 1; ++i) {
            // Kernel: 0.25, 0.5, 0.25 (Standard smoothing)
            buffer[i].x = 0.25f * points[i-1].x + 0.5f * points[i].x + 0.25f * points[i+1].x;
            buffer[i].y = 0.25f * points[i-1].y + 0.5f * points[i].y + 0.25f * points[i+1].y;
        }
        points = buffer;
    }
    return points;
}

float getPolylineLength(const std::vector<Point>& poly) {
    float len = 0;
    for (size_t i = 1; i < poly.size(); ++i) {
        len += dist(poly[i-1], poly[i]);
    }
    return len;
}

Point samplePolyline(const std::vector<Point>& poly, float t) {
    if (poly.empty()) return {0,0};
    if (t <= 0.0) return poly.front();
    if (t >= 1.0) return poly.back();

    float totalLen = getPolylineLength(poly);
    float targetDist = t * totalLen;
    
    float currentDist = 0;
    for (size_t i = 1; i < poly.size(); ++i) {
        float segLen = dist(poly[i-1], poly[i]);
        if (currentDist + segLen >= targetDist) {
            // Target is inside this segment
            float segT = (targetDist - currentDist) / segLen;
            return { 
                poly[i-1].x + segT * (poly[i].x - poly[i-1].x),
                poly[i-1].y + segT * (poly[i].y - poly[i-1].y)
            };
        }
        currentDist += segLen;
    }
    return poly.back();
}

// --- The Zipper ---
void applyCyclicZippering(std::vector<Point>& vecA, std::vector<Point>& vecB) {
    auto ranges = findCyclicRanges(vecA, vecB, std::sqrt(2.0f));

    for (const auto& r : ranges) {
        // 1. Extract Pieces
        // We extract exactly 'lengthA' points from A starting at 'startA'
        std::vector<Point> pieceA = extractCyclicChunk(vecA, r.startA, r.lengthA, false);
        
        // For B, we assume similar density. In a robust system, we would 
        // project StartA/EndA to find StartB/EndB. 
        // Simplified here: extract B points closest to pieceA's extent.

        int startB = getClosestIdx(vecA[r.startA], vecB);
        int lenB = 0;
        int nB = vecB.size();
        
        if (r.isFullLoop) {
            // FIX: If A is a full loop, B MUST be a full loop.
            // Do not calculate endB via projection, as it risks being == startB.
            lenB = vecB.size(); 
        } else {
            // Partial loop: Standard projection logic
            int endB = getClosestIdx(vecA[r.endA], vecB);

            if (r.isAntiparallel) {
                // Backwards distance: (Start - End)
                // We add nB before modulo to handle negative results safely
                lenB = (startB - endB + nB) % nB + 1;
            } else {
                // Forwards distance: (End - Start)
                lenB = (endB - startB + nB) % nB + 1;
            }
        }
        
        // Extract B (Order matters!)
        // If antiparallel, we extract from EndB to StartB (physically forward) then reverse?
        // Actually, cleaner: Extract naturally, then reverse result.
        std::vector<Point> pieceB; 
        if (r.isAntiparallel) {
            // Traverse B backwards: startB, startB-1, ... endB
            for(int k=0; k<lenB; ++k) pieceB.push_back(vecB[(startB - k + nB) % nB]);
        } else {
            // Traverse B forwards: startB, startB+1, ... endB
            for(int k=0; k<lenB; ++k) pieceB.push_back(vecB[(startB + k) % nB]);
        }

        // 2. Fit Splines
        std::vector<Point> splineA, splineB;
        if (r.isFullLoop) {
            splineA = fitClosedSpline(pieceA, 10);
            splineB = fitClosedSpline(pieceB, 10);
        } else {
            splineA = fitSmoothSpline(pieceA, 10);
            splineB = fitSmoothSpline(pieceB, 10);
        }

        // 3. Generate Mid-Spline
        int samples = 100;
        std::vector<Point> midSpline;
        for (int i = 0; i <= samples; ++i) {
            float t = (float)i / samples;
            Point pA = samplePolyline(splineA, t);
            Point pB = samplePolyline(splineB, t);
            midSpline.push_back({ (pA.x + pB.x)/2.0f, (pA.y + pB.y)/2.0f });
        }

        // 4. Snap Original Points
        // We must update the indices in A/B corresponding to the pieces we extracted
        auto snapToMid = [&](std::vector<Point>& vec, int start, int count, int direction) {
            for (int k = 0; k < count; ++k) {
                // Direction: +1 for forward, -1 for backward
                int idx = (start + (direction * k) + (int)vec.size()) % vec.size();
                
                // Project vec[idx] onto midSpline
                float bestDist = std::numeric_limits<float>::max();
                Point bestP = vec[idx];
                
                int mSize = midSpline.size();
                for(int m=0; m < mSize - 1; ++m) {
                    // Cyclic snap logic for MidSpline? 
                    // If isFullLoop, MidSpline is a loop (segment last->first exists)
                    Point v = midSpline[m];
                    Point w = midSpline[m+1];
                    Point proj = getClosestOnSegment(vec[idx], v, w);
                    float d = distSq(vec[idx], proj);
                    if(d < bestDist){ bestDist = d; bestP = proj; }
                }
                
                // If full loop, verify closing segment (last -> first)
                if (r.isFullLoop) {
                     Point proj = getClosestOnSegment(vec[idx], midSpline.back(), midSpline.front());
                     float d = distSq(vec[idx], proj);
                     if(d < bestDist) { bestDist = d; bestP = proj; }
                }

                vec[idx] = bestP;
            }
        };

        snapToMid(vecA, r.startA, r.lengthA, 1);
        snapToMid(vecB, startB, lenB, r.isAntiparallel ? -1 : 1);
    }
}
}

namespace contours6 {
float distSq(Point a, Point b) {
    return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y);
}

float dist(Point a, Point b) {
    return std::sqrt(distSq(a, b));
}

// Project P onto Segment V-W
Point getClosestOnSegment(Point p, Point v, Point w) {
    float l2 = distSq(v, w);
    if (l2 == 0.0) return v;
    float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = std::max(0.0f, std::min(1.0f, t));
    return { v.x + t * (w.x - v.x), v.y + t * (w.y - v.y) };
}

void snapToCenterline(std::vector<Point>& contour, std::vector<std::vector<Point>>& centerlines, float width, float height, float threshold) {
    for (int i=0; i<contour.size(); ++i) {

        float bestDist = std::numeric_limits<float>::max();
        Point bestP = contour[i];
        std::set<std::pair<int, int>> taken{};
        if (
            (bestP.x == 0.0) || 
            (bestP.x == width - 1.0f) ||
            (bestP.y == 0.0) ||
            (bestP.y == height - 1.0f)
        ) { continue; }

        std::pair<int, int> idx;
        std::pair<int, int> chosenIdx;
        for (int k=0; k<centerlines.size(); ++k) {
            auto cc = centerlines[k];

            for (int j=1; j < cc.size()-1; ++j){
                float d = distSq(contour[i], cc[j]);

                if (d > threshold) { continue; }
                
                idx = std::make_pair(k, j);
                //auto it = taken.find(idx);
                //if (it != taken.end()) { continue; }

                Point proj1 = getClosestOnSegment(contour[i], cc[j], cc[j-1]);
                Point proj2 = getClosestOnSegment(contour[i], cc[j+1], cc[j]);
                float d1 = distSq(contour[i], proj1);
                float d2 = distSq(contour[i], proj2);
                
                if ((d1 + d2) <= bestDist)
                { 
                    bestDist = d1 + d2; 
                    bestP = cc[j]; // proj; // 
                    chosenIdx = idx;
                }
            }
        }
        taken.insert(chosenIdx);
        contour[i] = bestP;
    }
}

// Normalize a vector
Point normalize(Point p) {
    float len = std::sqrt(p.x*p.x + p.y*p.y);
    if (len < 1e-6f) return {0.0f, 0.0f};
    return {p.x / len, p.y / len};
}

// Calculate "Bendiness" (Curvature Proxy)
// Returns 1.0 for Straight, -1.0 for Sharp U-Turn.
// Higher value = Straighter geometry.
float getLocalCurvature(const Point& prev, const Point& curr, const Point& next) {
    Point v1 = normalize({curr.x - prev.x, curr.y - prev.y});
    Point v2 = normalize({next.x - curr.x, next.y - curr.y});
    // Dot product: 1.0 means vectors are aligned (straight), < 1.0 means curved
    return v1.x * v2.x + v1.y * v2.y;
}

void snapToCenterline2(std::vector<Point>& contour, const std::vector<std::vector<Point>>& centerlines, float width, float height, float distThreshSq) {
    
    // Curvature Weight: Adjusts how much shape matters vs distance.
    // 10.0 is a strong bias towards shape matching.
    float curvWeight = 100.0f; 
    // float distThreshSq = distThreshold * distThreshold;

    // We track 'taken' indices outside the loop if we want to prevent 
    // multiple contour points from collapsing to the exact same centerline vertex (bunching).
    // However, for simple snapping, we just want the best fit for each point.
    
    for (int i = 0; i < contour.size(); ++i) {
        
        // 1. Boundary Guard
        // Skip points strictly on the image border (anchors)
        Point p = contour[i];
        if (std::abs(p.x) < 1e-5 || std::abs(p.x - (width - 1.0f)) < 1e-5 ||
            std::abs(p.y) < 1e-5 || std::abs(p.y - (height - 1.0f)) < 1e-5) {
            continue;
        }

        // 2. Calculate Contour Curvature (at i)
        // If start/end, assume straight (1.0) or use neighbor
        float myCurv = 1.0f;
        if (i > 0 && i < contour.size() - 1) {
            myCurv = getLocalCurvature(contour[i-1], contour[i], contour[i+1]);
        }

        float bestScore = std::numeric_limits<float>::max();
        Point bestP = contour[i];
        bool foundMatch = false;

        // 3. Search Centerlines
        for (const auto& cc : centerlines) {
            if (cc.size() < 2) continue;

            for (int j = 1; j < cc.size() - 1; ++j) {
                
                // Fast Rejection: Distance Check to Vertex
                float dVertex = distSq(p, cc[j]);
                if (dVertex > distThreshSq) continue;

                // 4. Calculate Centerline Curvature (at j)
                float lineCurv = getLocalCurvature(cc[j-1], cc[j], cc[j+1]);

                // 5. Curvature Score (Difference in bendiness)
                // We square the difference to punish mismatches heavily
                float curvDiff = myCurv - lineCurv;
                float curvCost = curvDiff * curvDiff * curvWeight;

                // 6. Geometry Projection (Subpixel Snap)
                // Project onto the two segments connected to vertex j
                // We pick the closest segment of the two
                Point proj1 = getClosestOnSegment(p, cc[j], cc[j-1]);
                Point proj2 = getClosestOnSegment(p, cc[j+1], cc[j]);
                
                float d1 = distSq(p, proj1);
                float d2 = distSq(p, proj2);
                
                float distCost = 0;
                Point candidatePos = cc[j]; // {0,0};

                if (d1 < d2) {
                    distCost = d1;
                    candidatePos = cc[j]; // proj1;
                } else {
                    distCost = d2;
                    candidatePos = cc[j]; // proj2;
                }

                // 7. Total Weighted Score
                float totalScore = distCost + curvCost;

                if (totalScore < bestScore) {
                    bestScore = totalScore;
                    bestP = candidatePos; // Snap to the actual projection, not vertex
                    foundMatch = true;
                }
            }
        }

        // Apply Snap
        if (foundMatch) {
            contour[i] = bestP;
        }
    }
}

void snapToCenterlineNeighbors(std::vector<Point>& contourA, std::vector<Point>& contourB, std::vector<std::vector<Point>>& centerlines, float width, float height, float threshold) {
    return;
}

// Result structure
struct SelectedSegment {
    int originalIndex;
    std::vector<Point> geometry; // Points (potentially reversed)
    int contourStartIdx;         // Where this segment "starts" on the contour
    int contourEndIdx;           // Where this segment "ends" on the contour
    float coverage;              // How much of the contour it spans
};

struct TrimmedSegment {
    std::vector<Point> geometry;
    int contourStartIdx; // The contour index where this segment starts
    int contourEndIdx;   // The contour index where this segment ends
    int span;            // Total coverage on contour
};

// Find closest index on contour for a given query point
// Returns {index, distanceSquared}
std::pair<int, float> getProjectedIndex(Point p, const std::vector<Point>& contour) {
    int bestIdx = -1;
    float bestDist = std::numeric_limits<float>::max();

    for (int i = 0; i < contour.size(); ++i) {
        float d = distSq(p, contour[i]);
        if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
        }
    }

    /*for (int i = 0; i < contour.size(); ++i) {
        Point proj = getClosestOnSegment(p, contour[i], contour[i+1]);
        float d = distSq(proj, contour[i]);
        if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
        }
    }*/

    return {bestIdx, bestDist};
}

// --- Main Function ---
void orderCenterlines(
    const std::vector<Point>& contour, 
    const std::vector<std::vector<Point>>& candidates, 
    std::vector<Point>& results,
    float distThreshSq
) {
    std::vector<SelectedSegment> validSegments;
    int contourLen = contour.size();

    // 1. Analyze Candidates
    for (int k = 0; k < candidates.size(); ++k) {
        const auto& cc = candidates[k];
        if (cc.empty()) continue;

        // Project Start and End to Contour
        auto resStart = getProjectedIndex(cc.front(), contour);
        auto resEnd   = getProjectedIndex(cc.back(), contour);

        // A. Distance Check: Is this centerline actually relevant?
        // We check the midpoint too, to be safe against long outliers
        Point mid = cc[cc.size() / 2];
        auto resMid = getProjectedIndex(mid, contour);

        if (resStart.second > distThreshSq || 
            resEnd.second > distThreshSq || 
            resMid.second > distThreshSq) {
            continue; // Too far from contour
        }

        // B. Span Check (Spur Removal)
        // Calculate the "length" this centerline covers on the contour
        int span = std::abs(resEnd.first - resStart.first);
        
        // Handle Cyclic Wraparound (Optional: assuming open contour for simplicity)
        // If span is extremely small but the centerline is geometrically long, it's a spur.
        float geometricLen = distSq(cc.front(), cc.back());
        
        // Threshold: The contour span must be significant compared to the geometric size.
        // If a long line projects to a single point, it's perpendicular (a spur).
        //if (span < 5 && geometricLen > 100.0f) { 
        //    continue; 
        //}

        // C. Create Segment Entry
        SelectedSegment seg;
        seg.originalIndex = k;
        seg.geometry = cc;
        
        // Determine Orientation
        // If Start maps to index 100 and End maps to index 50, it is backwards.
        if (resStart.first > resEnd.first) {
            std::reverse(seg.geometry.begin(), seg.geometry.end());
            seg.contourStartIdx = resEnd.first; // After reversal, start is min
            seg.contourEndIdx = resStart.first;
        } else {
            seg.contourStartIdx = resStart.first;
            seg.contourEndIdx = resEnd.first;
        }
        
        seg.coverage = (float)span;
        validSegments.push_back(seg);
    }

    // 2. Sort by Contour Position
    // We order them based on where they appear along the contour
    std::sort(validSegments.begin(), validSegments.end(), 
        [](const SelectedSegment& a, const SelectedSegment& b) {
            return a.contourStartIdx < b.contourStartIdx;
        });

    // 3. Resolve Overlaps (Optional Cleanup)
    // If Segment A covers [0-100] and Segment B covers [10-50], B is redundant/nested.
    // Simple logic: keep them all for now, but return ordered geometries.

    for (const auto& seg : validSegments) {
        for (auto &p: seg.geometry) {
            results.push_back(p);
        }
    }
    
    return;
}

// Check if candidate is plausible (Bounding Box / Sample Check)
bool isCandidateNearby(const std::vector<Point>& cc, const std::vector<Point>& contour, float distThreshSq) {
    // 1. Check Sampling (Start, Mid, End)
    // If ALL of these are far, it's likely a distant unrelated line.
    auto p1 = getProjectedIndex(cc.front(), contour);
    if (p1.second <= distThreshSq) return true;

    auto p2 = getProjectedIndex(cc.back(), contour);
    if (p2.second <= distThreshSq) return true;

    auto p3 = getProjectedIndex(cc[cc.size()/2], contour);
    if (p3.second <= distThreshSq) return true;

    // Aggressive prune: if 3 samples are all far, skip.
    return false;
}

// --- Interval Merging for Coverage ---
// Merges ranges like [0-10] and [5-15] into [0-15]
void addCoverage(std::vector<std::pair<int, int>>& intervals, int start, int end) {
    if (start > end) std::swap(start, end);
    intervals.push_back({start, end});
    std::sort(intervals.begin(), intervals.end());

    std::vector<std::pair<int, int>> merged;
    for (const auto& interval : intervals) {
        if (merged.empty() || interval.first > merged.back().second + 1) {
            merged.push_back(interval);
        } else {
            merged.back().second = std::max(merged.back().second, interval.second);
        }
    }
    intervals = merged;
}

int getTotalCoverage(const std::vector<std::pair<int, int>>& intervals) {
    int total = 0;
    for (const auto& i : intervals) total += (i.second - i.first + 1);
    return total;
}

void orderAndTrimCenterlines(
    const std::vector<Point>& contour, 
    const std::vector<std::vector<Point>>& candidates, 
    std::vector<Point>& results,
    float distThreshSq
) {
    std::vector<TrimmedSegment> allSegments;
    int minSegmentLen = 0; 
    int contourLen = contour.size();

    // Track covered ranges (e.g., [0-50], [100-150])
    std::vector<std::pair<int, int>> coveredRanges;
    int coverageTarget = (int)(contourLen * 1.0); // Stop if 95% covered

    // 1. Process Candidates
    for (const auto& cc : candidates) {
        if (cc.size() < 2) continue;

        // A. Early Rejection: Is this candidate even close?
        if (!isCandidateNearby(cc, contour, distThreshSq)) {
            continue; 
        }

        // B. Generate Validity Mask (Point-by-Point)
        std::vector<bool> isValid(cc.size(), false);
        bool hasValidPoints = false;
        
        for (int i = 0; i < cc.size(); ++i) {
            auto proj = getProjectedIndex(cc[i], contour);
            if (proj.second <= distThreshSq) {
                isValid[i] = true;
                hasValidPoints = true;
            }
        }
        if (!hasValidPoints) continue;

        // C. Extract Sub-Segments
        int start = -1;
        bool inside = false;

        auto addSegment = [&](int s, int e) {
            if (e - s < minSegmentLen) return;

            TrimmedSegment seg;
            for(int k=s; k<=e; ++k) seg.geometry.push_back(cc[k]);

            auto pStart = getProjectedIndex(cc[s], contour);
            auto pEnd   = getProjectedIndex(cc[e], contour);
            int cStart = pStart.first;
            int cEnd   = pEnd.first;

            // Orientation Fix
            if (cStart > cEnd) {
                std::reverse(seg.geometry.begin(), seg.geometry.end());
                std::swap(cStart, cEnd);
            }

            // Spur/Span Filter
            int span = std::abs(cEnd - cStart);
            if (span < 5) return; // Too short on contour timeline

            seg.contourStartIdx = cStart;
            seg.contourEndIdx = cEnd;
            seg.span = span;

            allSegments.push_back(seg);
            
            // UPDATE COVERAGE
            addCoverage(coveredRanges, cStart, cEnd);
        };

        for (int i = 0; i < cc.size(); ++i) {
            if (isValid[i] && !inside) { inside = true; start = i; }
            else if (!isValid[i] && inside) {
                addSegment(start, i - 1);
                inside = false;
            }
        }
        if (inside) addSegment(start, (int)cc.size() - 1);

        // D. Termination Check
        // If we have covered enough of the contour, stop looking at candidates
        if (getTotalCoverage(coveredRanges) >= coverageTarget) {
            std::cout << "Full coverage achieved. Stopping candidate search.\n";
            break;
        }
    }

    // 2. Sort Extracted Segments
    std::sort(allSegments.begin(), allSegments.end(), 
        [](const TrimmedSegment& a, const TrimmedSegment& b) {
            return a.contourStartIdx < b.contourStartIdx;
        });

    // 3. Output

    for (const auto& seg : allSegments) {
        for (auto &p: seg.geometry) {
            results.push_back(p);
        }
    }
    
    return;
}

void getProjectedIndices(Point p, const std::vector<Point>& contour, std::vector<std::pair<int, float>>& results) {
    int bestIdx = -1;
    float bestDist = std::numeric_limits<float>::max();

    for (int i = 0; i < contour.size(); ++i) {
        float d = distSq(p, contour[i]);
        results.push_back({i, d});
    }
}

void orderAndTrimCenterlines2(
    const std::vector<Point>& contour, 
    const std::vector<std::vector<Point>>& candidates, 
    std::vector<Point>& results,
    float distThreshSq
) {
    // collect all points nearest to contour points
    for (auto &p : contour){
        for (const auto& cc : candidates) {
            if (cc.size() < 2) continue;

            std::vector<std::pair<int, float>> cc_dists;
            getProjectedIndices(p, cc, cc_dists);

            std::sort(
                cc_dists.begin(), cc_dists.end(), 
                [](std::pair<int, float> a, std::pair<int, float> b){
                    return a.second < b.second;
                }
            );

            if (cc_dists[0].second > distThreshSq) { continue; }
            // B. find all points on cc close to p
            for (std::pair<int, float> &pp : cc_dists) {
                Point _p = cc[pp.first];
                bool exists = false;
                if (pp.second <= distThreshSq) {
                    for (auto & r: results) {
                        if ((_p.x == r.x) & (_p.y == r.y)) { 
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) { results.push_back(_p); }
                }
                if (pp.second > distThreshSq) { break; }
            }

        }
    }
}

}