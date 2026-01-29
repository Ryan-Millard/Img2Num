#include "bezier.h"
#include <iostream>

// --- Vector Math Helpers ---
inline Point sub(Point a, Point b) { return {a.x - b.x, a.y - b.y}; }
inline Point add(Point a, Point b) { return {a.x + b.x, a.y + b.y}; }
inline Point mul(Point a, float s) { return {a.x * s, a.y * s}; }
inline float dot(Point a, Point b) { return a.x * b.x + a.y * b.y; }
inline float distSq(Point a, Point b) { return (a.x - b.x)*(a.x - b.x) + (a.y - b.y)*(a.y - b.y); }
inline float len(Point a) { return std::sqrt(a.x*a.x + a.y*a.y); }

// --- Evaluate Quadratic Bezier at t ---
Point evalBezier(const QuadBezier& b, float t) {
    float invT = 1.0 - t;
    // B(t) = (1-t)^2 * P0 + 2*t*(1-t) * P1 + t^2 * P2
    float c0 = invT * invT;
    float c1 = 2.0f * t * invT;
    float c2 = t * t;
    return {
        c0 * b.p0.x + c1 * b.p1.x + c2 * b.p2.x,
        c0 * b.p0.y + c1 * b.p1.y + c2 * b.p2.y
    };
}

// --- Chord Length Parameterization ---
// Assigns a 't' value (0.0 to 1.0) to each point based on distance
std::vector<float> chordLengthParameterize(const std::vector<Point>& points, int first, int last) {
    std::vector<float> u;
    u.reserve(last - first + 1);
    u.push_back(0.0f);

    for (int i = first + 1; i <= last; ++i) {
        float dist = len(sub(points[i], points[i-1]));
        u.push_back(u.back() + dist);
    }

    float totalLen = u.back();
    if (totalLen == 0) return u; // Should not happen for valid ranges

    for (float& val : u) {
        val /= totalLen;
    }
    return u;
}

// --- Least Squares Fit for Control Point Q1 ---
// We know Q0 (Start) and Q2 (End). We need to find Q1 that minimizes error.
// Based on equation: P(t) = (1-t)^2 Q0 + 2t(1-t) Q1 + t^2 Q2
// Rearranged: Q1 * [2t(1-t)] = P(t) - (1-t)^2 Q0 - t^2 Q2
Point generateQuadBezier(const std::vector<Point>& points, int first, int last, const std::vector<float>& u) {
    Point Q0 = points[first];
    Point Q2 = points[last];

    float numX = 0.0, numY = 0.0;
    float den = 0.0;

    for (int i = 0; i < u.size(); ++i) {
        float t = u[i];
        float invT = 1.0f - t;
        
        // A = 2t(1-t)
        float A = 2.0f * t * invT; 
        
        // V = P_actual - (Contribution of Q0 and Q2)
        // V = P[i] - (1-t)^2 * Q0 - t^2 * Q2
        float B0 = invT * invT;
        float B2 = t * t;
        Point V = sub(points[first + i], add(mul(Q0, B0), mul(Q2, B2)));

        // Least Squares Sums
        numX += A * V.x;
        numY += A * V.y;
        den += A * A;
    }

    if (den < 1e-9) {
        // Fallback for straight lines (den is 0 if all t are 0 or 1)
        return add(Q0, mul(sub(Q2, Q0), 0.5));
    }

    return { numX / den, numY / den };
}

// --- Recursive Fit Function ---
void fitRecursive(const std::vector<Point>& points, int first, int last, 
                  float errorLimit, std::vector<QuadBezier>& outCurves) {
    
    // Base Case: Not enough points, just connect them
    if (last - first < 2) {
        // Just a line segment
        Point mid = add(points[first], mul(sub(points[last], points[first]), 0.5));
        outCurves.push_back({points[first], mid, points[last]});
        return;
    }

    // 1. Parameterize Points
    std::vector<float> u = chordLengthParameterize(points, first, last);

    // 2. Find Optimal Control Point (Q1)
    Point Q1 = generateQuadBezier(points, first, last, u);
    QuadBezier curve = { points[first], Q1, points[last] };

    // 3. Calculate Maximum Error
    float maxDistSq = 0.0f;
    int splitPoint = first;

    // Check distance of every intermediate point to the curve
    // Note: Technically we should find the nearest point on curve, 
    // but evaluating at parameter 't' is a standard approximation for speed.
    for (int i = 0; i < u.size(); ++i) {
        Point P = points[first + i];
        Point CurveP = evalBezier(curve, u[i]);
        float d2 = distSq(P, CurveP);
        
        if (d2 > maxDistSq) {
            maxDistSq = d2;
            splitPoint = first + i;
        }
    }

    // 4. Check Error Threshold
    if (maxDistSq < (errorLimit * errorLimit)) {
        outCurves.push_back(curve); // Fit is good!
    } else {
        // Fit is bad, split at the point of maximum error
        // Important: Prevent infinite recursion if split doesn't advance
        if (splitPoint == first || splitPoint == last) {
             // Fallback: simply bisect indices if geometric split fails
             splitPoint = (first + last) / 2;
        }
        
        fitRecursive(points, first, splitPoint, errorLimit, outCurves);
        fitRecursive(points, splitPoint, last, errorLimit, outCurves);
    }
}

// --- Main Wrapper ---
void fitCurveReduction(const std::vector<std::vector<Point>>& chains, std::vector<std::vector<QuadBezier>>& results, float tolerance) {
    // if (chain.empty()) return result;
    // results.resize(chains.size());
    for (int i = 0; i < chains.size(); ++i) {
        // Start recursion on the whole chain
        std::vector<QuadBezier> result;
        fitRecursive(chains[i], 0, chains[i].size() - 1, tolerance, result);

        /*std::cout << "Curve: " << std::endl;
        for (auto &c: result) {
            std::cout << "{ (" << c.p0.x << ", " << c.p0.y << ") " << ", (" << c.p1.x << ", " << c.p1.y << ") " << ", (" << c.p2.x << ", " << c.p2.y << ")}" << ", " << std::endl;
        }*/
        results.push_back(result);
    }
}