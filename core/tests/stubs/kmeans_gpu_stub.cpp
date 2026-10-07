#include "internal/kmeans_gpu.h"

// Replaces the kmeans_gpu implementation from core/src/internal/kmeans_gpu.cpp
// to satisfy kmeans.cpp without compiling or linking Dawn. CMake selects this
// source for the test target and omits the production GPU implementation; the
// stubs include directory also precedes core/include for the GPU header shim.
void kmeans_gpu(
    const uint8_t*, uint8_t*, int32_t*, const int32_t, const int32_t, const int32_t, const int32_t,
    const uint8_t
) {
}
