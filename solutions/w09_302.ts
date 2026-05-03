// src/webgpu/kmeans.ts
export const KMEANS_SHADER = `
  @group(0) @binding(0) var<storage, read> input: array<f32>;
  @group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
  @group(0) @binding(2) var<storage, read_write> assignments: array<u32>;
  @group(0) @binding(3) var<storage, read_write> counts: array<u32>;
  @group(0) @binding(4) var<storage, read_write> sums: array<f32>;

  struct Params {
    num_points: u32,
    num_clusters: u32,
    dimensions: u32,
  };
  @group(0) @binding(5) var<uniform> params: Params;

  // 16x16 workgroup = 256 threads, but dispatched as 2D grid
  @compute @workgroup_size(16, 16)
  fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let point_idx = id.x;
    let total_points = params.num_points;
    if (point_idx >= total_points) { return; }

    let dims = params.dimensions;
    let k = params.num_clusters;

    // Compute distance to each centroid
    var best_dist = 1e30f;
    var best_cluster = 0u;

    for (var c = 0u; c < k; c = c + 1u) {
      var dist = 0.0f;
      for (var d = 0u; d < dims; d = d + 1u) {
        let diff = input[point_idx * dims + d] - centroids[c * dims + d];
        dist = dist + diff * diff;
      }
      if (dist < best_dist) {
        best_dist = dist;
        best_cluster = c;
      }
    }

    assignments[point_idx] = best_cluster;

    // Accumulate for centroid update (atomic)
    for (var d = 0u; d < dims; d = d + 1u) {
      atomicAdd(&sums[best_cluster * dims + d], u32(input[point_idx * dims + d] * 1e6f));
    }
    atomicAdd(&counts[best_cluster], 1u);
  }
`;

export const UPDATE_CENTROIDS_SHADER = `
  @group(0) @binding(0) var<storage, read> sums: array<u32>;
  @group(0) @binding(1) var<storage, read> counts: array<u32>;
  @group(0) @binding(2) var<storage, read_write> centroids: array<f32>;

  struct Params {
    num_clusters: u32,
    dimensions: u32,
  };
  @group(0) @binding(3) var<uniform> params: Params;

  @compute @workgroup_size(64)
  fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let idx = id.x;
    let total = params.num_clusters * params.dimensions;
    if (idx >= total) { return; }

    let cluster = idx / params.dimensions;
    let dim = idx % params.dimensions;
    let count = counts[cluster];
    if (count > 0u) {
      centroids[idx] = f32(sums[idx]) / f32(count) / 1e6f;
    }
  }
`;
