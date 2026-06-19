#include "internal/douglas_peucker.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <vector>

// --- Signed perpendicular distance of P from the directed line A->B ---
// Positive = P lies to the "left" of the A->B travel direction (using the
// n = (-dy, dx) normal). Falls back to the point distance for a zero-length AB.
<<<<<<< HEAD
static inline float signed_left_dist(const Point &A, const Point &B, const Point &P) {
    const float dx = B.x - A.x, dy = B.y - A.y;
    const float l = std::sqrt(dx * dx + dy * dy);
    if (l < 1e-9f) return std::sqrt(Point::distSq(P, A));
    return ((P.y - A.y) * dx - (P.x - A.x) * dy) / l;
}

// --- Non-retracting Douglas-Peucker on points[lo..hi] ---
// Standard DP keeps the max-deviation vertex while the chord error exceeds eps.
// In addition we refuse to drop a run if doing so would pull the boundary
// *inward* (toward the region interior) by more than retract_eps at any vertex.
// `interior_sign` maps signed_left_dist to an interior(+)/exterior(-) sign for
// this polygon's winding, so dropping a convex bulge (exterior vertex) counts as
// retraction while flattening a concave dent (interior vertex) only grows the
// region and is always safe. Keeping retraction within the inter-region overlap
// margin is what prevents this from opening holes between neighbours.
static void dp_reduce(const std::vector<Point> &pts, int lo, int hi, float eps,
                      float retract_eps, float interior_sign, std::vector<uint8_t> &keep) {
    if (hi - lo < 2) return;  // no interior vertices to drop

    const Point &A = pts[lo];
    const Point &B = pts[hi];

    float max_abs_dev = 0.0f;  // worst |deviation| -> fidelity / split choice
    float max_retract = 0.0f;  // worst inward move -> watertightness guard
=======
static inline float signed_left_dist(const Point& A, const Point& B, const Point& P) {
    const float dx = B.x - A.x, dy = B.y - A.y;
    const float l = std::sqrt(dx * dx + dy * dy);
    if (l < 1e-9f)
        return std::sqrt(Point::distSq(P, A));
    return ((P.y - A.y) * dx - (P.x - A.x) * dy) / l;
}

/**
 * @brief Non-retracting Douglas–Peucker simplification for a polyline segment.
 *
 * Recursively simplifies the polyline defined by pts[lo..hi] using a Douglas–Peucker
 * strategy with an additional geometric constraint to prevent inward boundary collapse.
 *
 * The standard DP algorithm retains the point with maximum perpendicular deviation
 * from the chord (lo, hi) if that deviation exceeds `eps`. This variant introduces an
 * additional "non-retraction" rule: a candidate simplification is rejected if removing
 * intermediate vertices would cause the boundary to move inward (toward the region
 * interior) by more than `retract_eps` at any vertex.
 *
 * The sign of inward/outward movement is determined using `interior_sign`, which maps
 * signed left-distance to an interior (+) / exterior (-) convention based on the polygon
 * winding order. As a result:
 * - Removing convex (exterior) bulges is treated as potential retraction.
 * - Flattening concave (interior) dents is always considered safe, as it expands or
 *   preserves the region.
 *
 * This constraint ensures that simplification does not create excessive inward
 * collapse, which could otherwise introduce gaps between neighboring regions or
 * polygons separated by a limited overlap margin.
 *
 * @param pts            Input polyline points.
 * @param lo             Start index of the segment (inclusive).
 * @param hi             End index of the segment (inclusive).
 * @param eps            Maximum allowed perpendicular deviation for DP simplification.
 * @param retract_eps    Maximum allowed inward boundary retraction per vertex.
 * @param interior_sign  Sign mapping used to classify inward vs outward deviation
 *                       based on polygon winding.
 * @param keep           Output mask indicating which vertices are preserved.
 */
static void dp_reduce(
    const std::vector<Point>& pts, int lo, int hi, float eps, float retract_eps,
    float interior_sign, std::vector<uint8_t>& keep
) {
    if (hi - lo < 2)
        return; // no interior vertices to drop

    const Point& A = pts[lo];
    const Point& B = pts[hi];

    float max_abs_dev = 0.0f; // worst |deviation| -> fidelity / split choice
    float max_retract = 0.0f; // worst inward move -> watertightness guard
>>>>>>> dev_sync
    int split = lo;
    for (int k = lo + 1; k < hi; ++k) {
        const float d = signed_left_dist(A, B, pts[k]);
        const float adev = std::fabs(d);
        if (adev > max_abs_dev) {
            max_abs_dev = adev;
            split = k;
        }
        // interior_sign * d > 0 => vertex is interior (concave, safe to flatten);
        // < 0 => vertex is exterior (convex), dropping it retracts the boundary.
        const float retract = -interior_sign * d;
<<<<<<< HEAD
        if (retract > max_retract) max_retract = retract;
    }

    if (max_abs_dev <= eps && max_retract <= retract_eps) return;  // drop the run
=======
        if (retract > max_retract)
            max_retract = retract;
    }

    if (max_abs_dev <= eps && max_retract <= retract_eps)
        return; // drop the run
>>>>>>> dev_sync

    keep[split] = 1;
    dp_reduce(pts, lo, split, eps, retract_eps, interior_sign, keep);
    dp_reduce(pts, split, hi, eps, retract_eps, interior_sign, keep);
}

<<<<<<< HEAD
void dp_curve_reduction(const std::vector<std::vector<Point>> &chains,
                        const std::vector<std::vector<uint8_t>> &fixed,
                        std::vector<std::vector<QuadBezier>> &results, float eps) {
    if (const char *e = std::getenv("IMG2NUM_DP_EPS")) eps = static_cast<float>(std::atof(e));
    float retract_eps = std::min(eps, 0.5f);
    if (const char *r = std::getenv("IMG2NUM_DP_RETRACT"))
        retract_eps = static_cast<float>(std::atof(r));

    for (size_t i = 0; i < chains.size(); ++i) {
        const std::vector<Point> &chain = chains[i];
=======
/**
 * `@brief`
 * [Douglas-Peucker](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
 * contour point reduction with junction locking and retraction bounds.
 *
 * Reduces each contour's point count while preserving junctions and preventing gaps.
 * Fixed junctions marked by `fixed[i][k] != 0` are kept as exact shared endpoints.
 * Simplification is bounded to never retract a boundary inward past the inter-region
 * overlap margin, preventing gaps between neighboring regions. Kept points are emitted
 * as straight-line quadratic Bezier segments for compatibility with existing SVG output.
 *
 * `@param` chains Input polyline chains
 * `@param` fixed Junction mask: fixed[i][k] != 0 marks point k of chain i as a junction to preserve
 * `@param` results Output straight-line QuadBezier segments for each chain
 * `@param` eps Overall deviation tolerance in pixels
 *
 * `@note` retract_eps (max inward boundary move) defaults to min(eps, 0.5px)
 */
void dp_curve_reduction(
    const std::vector<std::vector<Point>>& chains, const std::vector<std::vector<uint8_t>>& fixed,
    std::vector<std::vector<QuadBezier>>& results, float eps
) {
    float retract_eps = std::min(eps, 0.5f);

    for (size_t i = 0; i < chains.size(); ++i) {
        const std::vector<Point>& chain = chains[i];
>>>>>>> dev_sync
        const int n = static_cast<int>(chain.size());
        std::vector<QuadBezier> result;
        if (n < 2) {
            results.push_back(result);
            continue;
        }

        // Orientation: sign of the shoelace area decides which side of a chord is
        // the region interior (see dp_reduce). Computed over the closed chain.
        double sa = 0.0;
        for (int k = 0; k < n; ++k) {
<<<<<<< HEAD
            const Point &p = chain[k];
            const Point &q = chain[(k + 1) % n];
=======
            const Point& p = chain[k];
            const Point& q = chain[(k + 1) % n];
>>>>>>> dev_sync
            sa += static_cast<double>(p.x) * q.y - static_cast<double>(q.x) * p.y;
        }
        const float interior_sign = (sa > 0.0) ? 1.0f : -1.0f;

        // Segment boundaries: chain ends plus every interior fixed point. DP runs
        // inside each [bounds[s], bounds[s+1]] span with its ends pinned.
        std::vector<int> bounds;
        bounds.push_back(0);
        for (int k = 1; k < n - 1; ++k)
<<<<<<< HEAD
            if (k < static_cast<int>(fixed[i].size()) && fixed[i][k]) bounds.push_back(k);
        bounds.push_back(n - 1);

        std::vector<uint8_t> keep(n, 0);
        for (int b : bounds) keep[b] = 1;
=======
            if (k < static_cast<int>(fixed[i].size()) && fixed[i][k])
                bounds.push_back(k);
        bounds.push_back(n - 1);

        std::vector<uint8_t> keep(n, 0);
        for (int b : bounds)
            keep[b] = 1;
>>>>>>> dev_sync
        for (size_t s = 0; s + 1 < bounds.size(); ++s)
            dp_reduce(chain, bounds[s], bounds[s + 1], eps, retract_eps, interior_sign, keep);

        // Emit kept points in order as straight-line quads.
        int prev = -1;
        for (int k = 0; k < n; ++k) {
<<<<<<< HEAD
            if (!keep[k]) continue;
            if (prev >= 0) {
                const Point &P = chain[prev];
                const Point &Q = chain[k];
=======
            if (!keep[k])
                continue;
            if (prev >= 0) {
                const Point& P = chain[prev];
                const Point& Q = chain[k];
>>>>>>> dev_sync
                result.push_back({P, (P + Q) * 0.5f, Q});
            }
            prev = k;
        }
        results.push_back(result);
    }
}
