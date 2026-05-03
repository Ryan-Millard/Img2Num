// src/webgpu/kmeans.ts
import { GPUDevice } from './device';

const MAX_BUFFER_SIZE = 2_147_483_648; // 2GB - max supported by WebGPU

export async function createKMeansPipeline(device: GPUDevice) {
  // Increase device maxBufferSize to maximum supported
  const adapter = await navigator.gpu.requestAdapter();
  const maxBufferSize = adapter?.limits.maxBufferSize || MAX_BUFFER_SIZE;
  
  // Update device limits
  const requiredLimits: GPUSupportedLimits = {
    maxBufferSize: Math.min(maxBufferSize, MAX_BUFFER_SIZE),
    maxStorageBufferBindingSize: Math.min(maxBufferSize, MAX_BUFFER_SIZE)
  };

  // Recreate device with updated limits if needed
  if (device.limits.maxBufferSize < MAX_BUFFER_SIZE) {
    device = await adapter!.requestDevice({
      requiredLimits
    });
  }

  // K-means++ shader with 16x16 workgroup size
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> input: array<f32>;
    @group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
    @group(0) @binding(2) var<storage, read_write> assignments: array<u32>;
    @group(0) @binding(3) var<uniform> params: vec4<u32>;

    // 16x16 workgroup = 256 threads total, but in 2D layout
    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) id: vec3<u32>) {
      let pixelIndex = id.x + id.y * params.x;
      if (pixelIndex >= params.x * params.y) { return; }

      let numCentroids = params.z;
      var minDist = 3.40282347e+38;
      var bestCentroid = 0u;

      // Distance calculation
      for (var c = 0u; c < numCentroids; c = c + 1u) {
        let offset = c * 3u;
        let dr = input[pixelIndex * 3u] - centroids[offset];
        let dg = input[pixelIndex * 3u + 1u] - centroids[offset + 1u];
        let db = input[pixelIndex * 3u + 2u] - centroids[offset + 2u];
        let dist = dr * dr + dg * dg + db * db;
        
        if (dist < minDist) {
          minDist = dist;
          bestCentroid = c;
        }
      }

      assignments[pixelIndex] = bestCentroid;
    }
  `;

  const shaderModule = device.createShaderModule({
    code: shaderCode
  });

  return device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main'
    }
  });
}

// Helper to create large buffers with proper size
export function createLargeBuffer(
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags
): GPUBuffer {
  const clampedSize = Math.min(size, device.limits.maxBufferSize);
  return device.createBuffer({
    size: clampedSize,
    usage,
    mappedAtCreation: false
  });
}
