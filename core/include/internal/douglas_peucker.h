#ifndef DOUGLAS_PEUCKER_H
#define DOUGLAS_PEUCKER_H

<<<<<<< HEAD
#include <cstdint>
#include <vector>

#include "internal/contours.h"

// Douglas-Peucker point reduction. Reduces each contour's point count directly
// (the bezier least-squares fit's only real purpose here was shrinking the SVG).
//
// `fixed[i][k]!=0` marks junctions/corners that must NOT be removed: the chain is
// split at them so every one survives as an exact, shared endpoint -- neighbours
// that share a junction therefore split at the SAME point. Simplification is
// bounded so it never retracts a boundary inward past the inter-region overlap
// margin, so reducing one region never eats its overlap with another and opens a
// gap. Kept points are emitted as straight-line quads, so the existing QuadBezier
// SVG path emission (and its closing 'Z') is unchanged.
//
// `eps`        : overall deviation tolerance (px). Env override IMG2NUM_DP_EPS.
// retract_eps  : max inward (region-shrinking) move allowed when dropping a
//                vertex; defaults to min(eps, 0.5px). Env override
//                IMG2NUM_DP_RETRACT.
void dp_curve_reduction(const std::vector<std::vector<Point>> &chains,
                        const std::vector<std::vector<uint8_t>> &fixed,
                        std::vector<std::vector<QuadBezier>> &results, float eps);
=======
#include "internal/contours.h"

#include <cstdint>
#include <vector>

/**
 * `@brief` Douglas-Peucker contour point reduction with junction locking and retraction bounds.
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
 * `@param` eps Overall deviation tolerance in pixels (overridable via IMG2NUM_DP_EPS env var)
 *
 * `@note` retract_eps (max inward boundary move) defaults to min(eps, 0.5px) and can be
 *       overridden via IMG2NUM_DP_RETRACT environment variable.
 */
void dp_curve_reduction(
    const std::vector<std::vector<Point>>& chains, const std::vector<std::vector<uint8_t>>& fixed,
    std::vector<std::vector<QuadBezier>>& results, float eps
);
>>>>>>> dev_sync

#endif
