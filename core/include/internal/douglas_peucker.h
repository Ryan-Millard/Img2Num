#ifndef DOUGLAS_PEUCKER_H
#define DOUGLAS_PEUCKER_H

#include <cstdint>
#include <vector>

#include "internal/contours.h"

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
void dp_curve_reduction(const std::vector<std::vector<Point>> &chains,
                        const std::vector<std::vector<uint8_t>> &fixed,
                        std::vector<std::vector<QuadBezier>> &results, float eps);

#endif
