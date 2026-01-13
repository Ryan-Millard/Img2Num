
#include "contours.h"

namespace suzuki {

// 8-neighborhood, clockwise order starting from "right" (dx=+1,dy=0).
// (y increases downward)
static constexpr int DX[8] = { +1, +1,  0, -1, -1, -1,  0, +1 };
static constexpr int DY[8] = {  0, +1, +1, +1,  0, -1, -1, -1 };

// Map (dy,dx) to direction index in [0..7]
static inline int dirIndex(int dy, int dx) {
    if (dy == 0  && dx == 1)  return 0;
    if (dy == 1  && dx == 1)  return 1;
    if (dy == 1  && dx == 0)  return 2;
    if (dy == 1  && dx == -1) return 3;
    if (dy == 0  && dx == -1) return 4;
    if (dy == -1 && dx == -1) return 5;
    if (dy == -1 && dx == 0)  return 6;
    if (dy == -1 && dx == 1)  return 7;
    return -1; // not a neighbor
}

static inline int dirIndexFromTo(int y, int x, int ny, int nx) {
    return dirIndex(ny - y, nx - x);
}

// Border following (Algorithm 1, steps 3.1..3.5):
// - f is a padded image (0=background; nonzero=object/labels)
// - (sy,sx) is the border start point (nonzero)
// - (py,px) is the "previous" neighbor used to define search direction (usually a 0-pixel)
// - nbd is the new border label
// Returns the contour as points in *unpadded* coordinates (x-1,y-1).
static std::vector<Point> traceBorder(std::vector<int>& f, int paddedW,
                                      int sy, int sx, int py, int px,
                                      int nbd)
{
    auto at = [&](int y, int x) -> int& { return f[y * paddedW + x]; };
    auto get = [&](int y, int x) -> int  { return f[y * paddedW + x]; };

    std::vector<Point> pts;

    // (3.1) Find first nonzero neighbor around (sy,sx), scanning clockwise from (py,px)
    const int dStart = dirIndexFromTo(sy, sx, py, px);
    if (dStart < 0) {
        throw std::runtime_error("traceBorder: invalid previous neighbor (not adjacent).");
    }

    int y1 = 0, x1 = 0;
    bool found = false;
    for (int t = 0; t < 8; ++t) {
        int d = (dStart + t) & 7; // clockwise
        int ny = sy + DY[d], nx = sx + DX[d];
        if (get(ny, nx) != 0) {
            y1 = ny; x1 = nx;
            found = true;
            break;
        }
    }

    // If isolated pixel: set f(sy,sx) = -NBD and return single-point contour
    if (!found) {
        at(sy, sx) = -nbd;
        pts.push_back(Point{sx - 1, sy - 1});
        return pts;
    }

    // (3.2)
    int y2 = y1, x2 = x1;    // previous border pixel
    int y3 = sy, x3 = sx;    // current border pixel
    const int firstY = y1, firstX = x1;

    while (true) {
        // (3.3) Search CCW around (y3,x3), starting from "next after (y2,x2) in CCW order"
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
                y4 = ny; x4 = nx;
                break;
            }
        }

        // (3.4) Marking policy
        if (rightZeroExamined) {
            at(y3, x3) = -nbd;
        } else {
            if (at(y3, x3) == 1) {
                at(y3, x3) = nbd;
            }
        }

        // Record current point in unpadded coordinates
        pts.push_back(Point{x3 - 1, y3 - 1});

        // (3.5) Termination check
        if (y4 == sy && x4 == sx && y3 == firstY && x3 == firstX) {
            break;
        }

        // Advance
        y2 = y3; x2 = x3;
        y3 = y4; x3 = x4;
    }

    return pts;
}

ContoursResult findContoursSuzuki(const std::vector<uint8_t>& binary, int width, int height)
{
    if (width <= 0 || height <= 0) {
        return {};
    }
    if ((int)binary.size() != width * height) {
        throw std::invalid_argument("binary.size() must be width*height");
    }

    // Pad image with a 1-pixel 0-frame
    const int paddedW = width + 2;
    const int paddedH = height + 2;
    std::vector<int> f(paddedW * paddedH, 0);

    auto at = [&](int y, int x) -> int& { return f[y * paddedW + x]; };
    auto get = [&](int y, int x) -> int  { return f[y * paddedW + x]; };

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            at(y + 1, x + 1) = (binary[y * width + x] != 0) ? 1 : 0;
        }
    }

    // Border node info stored by border id (NBD). ID=1 is the frame (special hole border).
    struct NodeInfo {
        bool is_hole = false;
        int parent_id = 0;              // parent border id
        std::vector<Point> points;      // contour points (unpadded coords)
        bool used = false;
    };

    int nbd = 1;
    std::vector<NodeInfo> nodes(2);
    nodes[1].is_hole = true;    // frame is treated as a hole border
    nodes[1].parent_id = 1;     // self-parent for convenience
    nodes[1].used = true;

    // Raster scan (Algorithm 1, step 1..4)
    for (int y = 1; y <= height; ++y) {
        int lnbd = 1; // reset each row

        for (int x = 1; x <= width; ++x) {
            int fij = get(y, x);
            if (fij == 0) continue; // Algorithm processes only fij != 0

            bool startBorder = false;
            bool isHole = false;
            int py = 0, px = 0;

            // (1a) Outer border start: fij==1 and left is 0
            if (fij == 1 && get(y, x - 1) == 0) {
                ++nbd;
                startBorder = true;
                isHole = false;
                py = y; px = x - 1;
            }
            // (1b) Hole border start: fij>=1 and right is 0
            else if (fij >= 1 && get(y, x + 1) == 0) {
                ++nbd;
                startBorder = true;
                isHole = true;
                py = y; px = x + 1;

                // LNBD <- fij if fij > 1 (per Appendix I)
                if (fij > 1) {
                    lnbd = fij;
                }
            }

            if (startBorder) {
                if ((int)nodes.size() <= nbd) nodes.resize(nbd + 1);

                nodes[nbd].is_hole = isHole;
                nodes[nbd].used = true;

                // (2) Decide parent using Table 1:
                // If types match -> parent(B)=parent(B'), else parent(B)=B'
                // where B' is border with id LNBD.
                const bool bprimeIsHole = nodes[lnbd].is_hole;
                const int parent_id = (isHole == bprimeIsHole) ? nodes[lnbd].parent_id : lnbd;
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

    // Convert from border ids (2..nbd) to compact 0-based contour indices (frame excluded)
    std::vector<int> idToIdx(nbd + 1, -1);
    ContoursResult out;

    out.contours.reserve(std::max(0, nbd - 1));
    out.hierarchy.reserve(std::max(0, nbd - 1));
    out.is_hole.reserve(std::max(0, nbd - 1));

    for (int id = 2; id <= nbd; ++id) {
        if (!nodes[id].used) continue;
        idToIdx[id] = (int)out.contours.size();
        out.contours.push_back(nodes[id].points);
        out.is_hole.push_back(nodes[id].is_hole);
        out.hierarchy.push_back({-1, -1, -1, -1});
    }

    // Fill parent index
    for (int id = 2; id <= nbd; ++id) {
        if (!nodes[id].used) continue;
        const int idx = idToIdx[id];
        const int pid = nodes[id].parent_id;
        out.hierarchy[idx][3] = (pid <= 1) ? -1 : idToIdx[pid]; // parent
    }

    // Build child/sibling links (first_child, next, prev)
    std::vector<int> lastChild(out.contours.size(), -1);

    for (int i = 0; i < (int)out.contours.size(); ++i) {
        int p = out.hierarchy[i][3];
        if (p < 0) continue;

        if (out.hierarchy[p][2] == -1) {
            out.hierarchy[p][2] = i;      // first_child
            lastChild[p] = i;
        } else {
            int last = lastChild[p];
            out.hierarchy[last][0] = i;   // next sibling
            out.hierarchy[i][1] = last;   // prev sibling
            lastChild[p] = i;
        }
    }

    return out;
}

} // namespace suzuki
