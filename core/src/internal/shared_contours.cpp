#include "internal/shared_contours.h"

#include "internal/bezier.h"

#include <algorithm>
#include <cmath>
#include <limits>
#include <map>
#include <set>
#include <unordered_map>
#include <utility>
#include <vector>

constexpr int SMOOTHING_ITERATIONS {5};
constexpr int32_t OUTSIDE = std::numeric_limits<int32_t>::min(); // image exterior label

// Endpoint- and border-preserving smoothing of a corner polyline. Points sitting
// on the image frame are locked so the canvas rectangle stays crisp.
void smooth_edge(std::vector<Point>& p, int w, int h, int iters) {
    const int n = static_cast<int>(p.size());
    if (n < 3)
        return;
    auto on_border = [&](const Point& q) {
        return q.x <= 0.0f || q.y <= 0.0f || q.x >= w || q.y >= h;
    };
    for (int it = 0; it < iters; ++it) {
        std::vector<Point> q = p;
        for (int i = 1; i < n - 1; ++i) {
            if (on_border(p[i]))
                continue;
            const Point& a = p[i - 1];
            const Point& b = p[i];
            const Point& c = p[i + 1];
            q[i] = {0.25f * a.x + 0.5f * b.x + 0.25f * c.x, 0.25f * a.y + 0.5f * b.y + 0.25f * c.y};
        }
        p.swap(q);
    }
}

// Smooth a corner chain (endpoints fixed) and fit it to quadratic beziers. Done
// once per canonical edge; both adjacent regions reuse the result, so the fitted
// curve is shared and the two regions stay exactly coincident.
std::vector<QuadBezier> fit_edge(const std::vector<Point>& corners, int w, int h, float eps) {
    std::vector<Point> pts = corners;
    smooth_edge(pts, w, h, SMOOTHING_ITERATIONS);
    if (pts.size() < 2)
        return {};
    std::vector<std::vector<Point>> chain {pts};
    std::vector<std::vector<QuadBezier>> res;
    fit_curve_reduction(chain, res, eps);
    return res.empty() ? std::vector<QuadBezier> {} : res[0];
}

void reverse_curve(std::vector<QuadBezier>& c) {
    std::reverse(c.begin(), c.end());
    for (QuadBezier& q : c)
        std::swap(q.p0, q.p2);
}

std::unordered_map<int32_t, std::vector<std::vector<QuadBezier>>>
build_shared_loops(const std::vector<int32_t>& labels, int w, int h, float eps) {
    const int W1 = w + 1; // corner grid width
    auto L = [&](int x, int y) -> int32_t {
        if (x < 0 || x >= w || y < 0 || y >= h)
            return OUTSIDE;
        return labels[static_cast<size_t>(y) * w + x];
    };
    auto cidx = [&](int cx, int cy) {
        return cy * W1 + cx;
    };
    auto cx_of = [&](int idx) {
        return idx % W1;
    };
    auto cy_of = [&](int idx) {
        return idx / W1;
    };
    auto pt_of = [&](int idx) {
        return Point {static_cast<float>(cx_of(idx)), static_cast<float>(cy_of(idx))};
    };

    // --- 1. Undirected crack adjacency over corners ---------------------------
    std::unordered_map<int, std::vector<int>> adj;
    auto add_crack = [&](int a, int b) {
        adj[a].push_back(b);
        adj[b].push_back(a);
    };
    for (int cy = 0; cy <= h; ++cy)
        for (int cx = 0; cx <= w; ++cx) {
            if (cy < h && L(cx - 1, cy) != L(cx, cy))
                add_crack(cidx(cx, cy), cidx(cx, cy + 1));
            if (cx < w && L(cx, cy - 1) != L(cx, cy))
                add_crack(cidx(cx, cy), cidx(cx + 1, cy));
        }

    // A corner is a junction wherever its crack degree != 2: degree 3/4 are branch
    // points (incl. diagonal pixel touches), degree 1 is a dangling end. Degree-2
    // corners are interior to a single two-region edge.
    auto is_junction = [&](int idx) {
        auto it = adj.find(idx);
        return it == adj.end() ? false : it->second.size() != 2;
    };

    // --- 2. Extract canonical edges (junction -> junction chains) -------------
    struct Edge {
        int a, b;                      // endpoint corners
        bool closed;                   // junction-free loop
        std::vector<int> path;         // full corner sequence (closed: ring, no repeat)
        std::vector<QuadBezier> curve; // fitted curve (front@a .. back@b)
    };
    std::vector<Edge> edges;
    std::map<std::pair<int, int>, int> crack_edge; // undirected crack -> edge id
    auto ckey = [](int a, int b) {
        return std::make_pair(std::min(a, b), std::max(a, b));
    };

    auto store_edge = [&](std::vector<int> seq, bool closed) {
        std::vector<int> cseq = seq;
        if (closed)
            cseq.push_back(seq.front()); // close the ring for geometry
        Edge e;
        e.closed = closed;
        e.path = std::move(seq);
        e.a = cseq.front();
        e.b = cseq.back();
        std::vector<Point> corners;
        corners.reserve(cseq.size());
        for (int c : cseq)
            corners.push_back(pt_of(c));
        e.curve = fit_edge(corners, w, h, eps);
        int id = static_cast<int>(edges.size());
        for (size_t i = 0; i + 1 < cseq.size(); ++i)
            crack_edge[ckey(cseq[i], cseq[i + 1])] = id;
        edges.push_back(std::move(e));
    };

    auto walk_edge = [&](int start, int first_next) {
        std::vector<int> seq {start};
        int prev = start, cur = first_next;
        while (true) {
            seq.push_back(cur);
            if (is_junction(cur))
                break;
            int nxt = -1;
            for (int nb : adj[cur])
                if (nb != prev) {
                    nxt = nb;
                    break;
                }
            if (nxt < 0 || cur == start)
                break;
            prev = cur;
            cur = nxt;
        }
        return seq;
    };

    // 2a. edges between junctions
    for (auto& kv : adj) {
        if (!is_junction(kv.first))
            continue;
        for (int nb : kv.second)
            if (!crack_edge.count(ckey(kv.first, nb)))
                store_edge(walk_edge(kv.first, nb), false);
    }
    // 2b. junction-free closed loops
    for (auto& kv : adj) {
        for (int nb : kv.second) {
            if (crack_edge.count(ckey(kv.first, nb)))
                continue;
            std::vector<int> seq {kv.first};
            int prev = kv.first, cur = nb;
            const size_t cap = adj.size() + 4;
            while (cur != kv.first && seq.size() < cap) {
                seq.push_back(cur);
                int nxt = -1;
                for (int x : adj[cur])
                    if (x != prev) {
                        nxt = x;
                        break;
                    }
                if (nxt < 0)
                    break;
                prev = cur;
                cur = nxt;
            }
            // canonicalise start to smallest corner so both regions agree.
            int mpos = 0;
            for (size_t i = 0; i < seq.size(); ++i)
                if (seq[i] < seq[mpos])
                    mpos = static_cast<int>(i);
            const int mm = static_cast<int>(seq.size());
            std::vector<int> rot;
            rot.reserve(mm);
            for (int i = 0; i < mm; ++i)
                rot.push_back(seq[(mpos + i) % mm]);
            store_edge(rot, true);
        }
    }

    // --- 3. Per-region directed boundary cracks (region kept on the RIGHT) ----
    std::unordered_map<int32_t, std::map<int, std::vector<int>>> region_dir;
    for (int y = 0; y < h; ++y)
        for (int x = 0; x < w; ++x) {
            int32_t r = L(x, y);
            auto& dir = region_dir[r];
            const int c00 = cidx(x, y), c10 = cidx(x + 1, y);
            const int c11 = cidx(x + 1, y + 1), c01 = cidx(x, y + 1);
            if (L(x, y - 1) != r)
                dir[c00].push_back(c10); // top
            if (L(x + 1, y) != r)
                dir[c10].push_back(c11); // right
            if (L(x, y + 1) != r)
                dir[c11].push_back(c01); // bottom
            if (L(x - 1, y) != r)
                dir[c01].push_back(c00); // left
        }

    auto unit = [&](int from, int to, int& dx, int& dy) {
        dx = cx_of(to) - cx_of(from);
        dy = cy_of(to) - cy_of(from);
    };

    // --- 4. Assemble each region's loops from canonical shared curves ---------
    std::unordered_map<int32_t, std::vector<std::vector<QuadBezier>>> result;
    for (auto& rkv : region_dir) {
        int32_t r = rkv.first;
        if (r == OUTSIDE)
            continue;
        std::map<int, std::vector<int>> dir = rkv.second; // erased as consumed

        // right-hand rule: prefer right, straight, left, back of incoming dir.
        auto take_from = [&](int from, int dx_in, int dy_in) -> int {
            auto it = dir.find(from);
            if (it == dir.end() || it->second.empty())
                return -1;
            auto& outs = it->second;
            int pref[4][2] = {{-dy_in, dx_in}, {dx_in, dy_in}, {dy_in, -dx_in}, {-dx_in, -dy_in}};
            for (auto& pr : pref)
                for (size_t k = 0; k < outs.size(); ++k) {
                    int dx, dy;
                    unit(from, outs[k], dx, dy);
                    if (dx == pr[0] && dy == pr[1]) {
                        int to = outs[k];
                        outs.erase(outs.begin() + k);
                        return to;
                    }
                }
            int to = outs.back();
            outs.pop_back();
            return to;
        };

        std::vector<std::vector<int>> loops;
        for (auto& it : dir) {
            while (!it.second.empty()) {
                int start = it.first;
                int nxt = take_from(start, 1, 0);
                if (nxt < 0)
                    break;
                std::vector<int> loop {start};
                int dx_in, dy_in;
                unit(start, nxt, dx_in, dy_in);
                int cur = nxt;
                while (cur != start) {
                    loop.push_back(cur);
                    int nn = take_from(cur, dx_in, dy_in);
                    if (nn < 0)
                        break;
                    unit(cur, nn, dx_in, dy_in);
                    cur = nn;
                }
                loops.push_back(std::move(loop));
            }
        }

        std::vector<std::vector<QuadBezier>>& out_loops = result[r];
        for (auto& loop : loops) {
            int m = static_cast<int>(loop.size());
            if (m < 2)
                continue;
            // rotate so the loop starts at a junction (edges are entered at ends).
            int js = -1;
            for (int t = 0; t < m; ++t)
                if (is_junction(loop[t])) {
                    js = t;
                    break;
                }
            if (js > 0)
                std::rotate(loop.begin(), loop.begin() + js, loop.end());

            std::vector<QuadBezier> curve;
            int i = 0;
            while (i < m) {
                int from = loop[i];
                int to = loop[(i + 1) % m];
                auto eit = crack_edge.find(ckey(from, to));
                if (eit == crack_edge.end()) {
                    ++i;
                    continue;
                }
                const Edge& e = edges[eit->second];
                std::vector<QuadBezier> seg = e.curve;
                if (e.closed) {
                    int mm = static_cast<int>(e.path.size());
                    int p = 0;
                    while (p < mm && e.path[p] != from)
                        ++p;
                    bool fwd = (p < mm) && (e.path[(p + 1) % mm] == to);
                    if (!fwd)
                        reverse_curve(seg);
                    for (const QuadBezier& q : seg)
                        curve.push_back(q);
                    i = m;
                } else {
                    bool fwd = (from == e.a);
                    if (!fwd)
                        reverse_curve(seg);
                    for (const QuadBezier& q : seg)
                        curve.push_back(q);
                    int other = fwd ? e.b : e.a;
                    int j = i + 1;
                    while (j < m && loop[j] != other)
                        ++j;
                    i = j;
                }
            }
            if (curve.size() >= 2)
                out_loops.push_back(std::move(curve));
        }
    }

    return result;
}
