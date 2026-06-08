#ifndef DOUGLAS_PEUCKER_H
#define DOUGLAS_PEUCKER_H

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

#endif
