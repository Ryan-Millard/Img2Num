#ifndef BEZIER_H
#define BEZIER_H

#include "internal/contours.h"

<<<<<<< HEAD
void fit_curve_reduction(const std::vector<std::vector<Point>> &chains,
                         std::vector<std::vector<QuadBezier>> &results, float tolerance);
=======
void fit_curve_reduction(
    const std::vector<std::vector<Point>>& chains, std::vector<std::vector<QuadBezier>>& results,
    float tolerance
);
>>>>>>> dev_sync

// Same, but `fixed[i][k]!=0` marks point k of chain i as a junction that must NOT
// move: the chain is split at those points so each becomes an exact (pinned)
// curve endpoint. Chains with no fixed points fit identically to the overload
// above.
<<<<<<< HEAD
void fit_curve_reduction(const std::vector<std::vector<Point>> &chains,
                         const std::vector<std::vector<uint8_t>> &fixed,
                         std::vector<std::vector<QuadBezier>> &results, float tolerance);
=======
void fit_curve_reduction(
    const std::vector<std::vector<Point>>& chains, const std::vector<std::vector<uint8_t>>& fixed,
    std::vector<std::vector<QuadBezier>>& results, float tolerance
);
>>>>>>> dev_sync
#endif
