// src/webgpu/kmeans.ts
export const KMEANS_SHADER = `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
@group(0) @binding(2) var<storage, read_write> labels: array<u32>;
@group(0) @binding(3) var<storage, read_write> counts: array<u32>;
@group(0) @binding(4) var<storage, read_write> sums: array<f32>;

struct Uniforms {
  num_points: u32,
  num_clusters: u32,
  dimensions: u32,
};
@group(0) @binding(5) var<uniform> uniforms: Uniforms;

// 16x16 workgroup = 256 threads total, but dispatched as 2D grid
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let point_idx = id.x + id.y * 16u; // Map 2D to 1D index
  if (point_idx >= uniforms.num_points) {
    return;
  }

  var min_dist = f32(1e10);
  var best_cluster = 0u;

  for (var c = 0u; c < uniforms.num_clusters; c = c + 1u) {
    var dist = 0.0;
    for (var d = 0u; d < uniforms.dimensions; d = d + 1u) {
      let diff = input[point_idx * uniforms.dimensions + d] - centroids[c * uniforms.dimensions + d];
      dist = dist + diff * diff;
    }
    if (dist < min_dist) {
      min_dist = dist;
      best_cluster = c;
    }
  }

  labels[point_idx] = best_cluster;
  atomicAdd(&counts[best_cluster], 1u);
  for (var d = 0u; d < uniforms.dimensions; d = d + 1u) {
    atomicAdd(&sums[best_cluster * uniforms.dimensions + d], input[point_idx * uniforms.dimensions + d]);
  }
}
`;

// src/webgpu/device.ts
export async function createWebGPUDevice(): Promise<GPUDevice> {
  if (!navigator.gpu) {
    throw new Error('WebGPU not supported');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No WebGPU adapter found');
  }

  const device = await adapter.requestDevice({
    requiredLimits: {
      maxBufferSize: adapter.limits.maxBufferSize, // Use maximum supported by GPU
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    },
  });

  return device;
}

// src/webgpu/buffer.ts
export function createBuffer(
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags,
  label?: string
): GPUBuffer {
  const maxSize = device.limits.maxBufferSize;
  if (size > maxSize) {
    throw new Error(
      `Buffer size ${size} exceeds device limit ${maxSize}. ` +
      `Consider reducing image size or splitting into chunks.`
    );
  }

  return device.createBuffer({
    size,
    usage,
    label: label || `buffer_${size}`,
  });
}

// src/webgpu/pipeline.ts
export function createKMeansPipeline(
  device: GPUDevice,
  shaderModule: GPUShaderModule
): GPUComputePipeline {
  return device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });
}

// src/webgpu/dispatch.ts
export function dispatchKMeans(
  device: GPUDevice,
  pipeline: GPUComputePipeline,
  bindGroup: GPUBindGroup,
  numPoints: number
): void {
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);

  // Dispatch as 2D grid: ceil(numPoints / 256) workers, but using 16x16 workgroups
  const workgroupSize = 16; // 16x16 = 256 threads
  const groupsX = Math.ceil(numPoints / (workgroupSize * workgroupSize));
  const groupsY = 1; // We only need 1D dispatch mapped to 2D

  passEncoder.dispatchWorkgroups(groupsX, groupsY);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
}

// src/webgpu/init.ts
export async function initializeWebGPU(): Promise<{
  device: GPUDevice;
  shaderModule: GPUShaderModule;
  pipeline: GPUComputePipeline;
}> {
  const device = await createWebGPUDevice();
  const shaderModule = device.createShaderModule({
    code: KMEANS_SHADER,
  });
  const pipeline = createKMeansPipeline(device, shaderModule);

  return { device, shaderModule, pipeline };
}
