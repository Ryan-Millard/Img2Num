// src/webgpu/kmeans.ts
import { GPUDevice } from './device';

const MAX_BUFFER_SIZE = 2_147_483_648; // 2GB (max supported by WebGPU)

export async function kmeansPlusPlus(
  device: GPUDevice,
  data: Float32Array,
  k: number,
  maxIterations: number = 100
): Promise<{ centroids: Float32Array; labels: Uint32Array }> {
  const adapter = await navigator.gpu.requestAdapter();
  const gpuDevice = await adapter!.requestDevice({
    requiredLimits: {
      maxBufferSize: MAX_BUFFER_SIZE,
    },
  });

  // Increase buffer size limit
  const bufferSize = Math.min(data.byteLength, MAX_BUFFER_SIZE);
  
  // Create storage buffer with increased limit
  const dataBuffer = gpuDevice.createBuffer({
    size: bufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });

  // Write data to buffer
  gpuDevice.queue.writeBuffer(dataBuffer, 0, data);

  // Shader with 16x16 workgroup size (256 total workers)
  const shaderCode = `
    struct Data {
      values: array<f32>,
    };

    struct Centroids {
      values: array<f32>,
    };

    struct Labels {
      values: array<u32>,
    };

    @group(0) @binding(0) var<storage, read> data: Data;
    @group(0) @binding(1) var<storage, read_write> centroids: Centroids;
    @group(0) @binding(2) var<storage, read_write> labels: Labels;

    // 16x16 workgroup = 256 workers
    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) id: vec3<u32>) {
      let index = id.x + id.y * 16u;
      if (index >= arrayLength(&data.values)) {
        return;
      }

      // K-means++ initialization logic
      var minDist: f32 = 1e10;
      var bestCentroid: u32 = 0u;

      for (var c: u32 = 0u; c < arrayLength(&centroids.values) / 3u; c = c + 1u) {
        let cx = centroids.values[c * 3u];
        let cy = centroids.values[c * 3u + 1u];
        let cz = centroids.values[c * 3u + 2u];

        let dx = data.values[index * 3u] - cx;
        let dy = data.values[index * 3u + 1u] - cy;
        let dz = data.values[index * 3u + 2u] - cz;

        let dist = dx * dx + dy * dy + dz * dz;
        if (dist < minDist) {
          minDist = dist;
          bestCentroid = c;
        }
      }

      labels.values[index] = bestCentroid;
    }
  `;

  const shaderModule = gpuDevice.createShaderModule({
    code: shaderCode,
  });

  const computePipeline = gpuDevice.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });

  // Create bind group
  const centroidsBuffer = gpuDevice.createBuffer({
    size: k * 3 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const labelsBuffer = gpuDevice.createBuffer({
    size: data.length / 3 * Uint32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const bindGroup = gpuDevice.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: dataBuffer } },
      { binding: 1, resource: { buffer: centroidsBuffer } },
      { binding: 2, resource: { buffer: labelsBuffer } },
    ],
  });

  // Dispatch with 16x16 workgroups
  const workgroupCountX = Math.ceil(data.length / (3 * 256));
  const workgroupCountY = 1;

  const commandEncoder = gpuDevice.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
  passEncoder.end();

  gpuDevice.queue.submit([commandEncoder.finish()]);

  // Read back results
  const readBuffer = gpuDevice.createBuffer({
    size: labelsBuffer.size,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  commandEncoder.copyBufferToBuffer(labelsBuffer, 0, readBuffer, 0, readBuffer.size);
  await readBuffer.mapAsync(GPUMapMode.READ);
  const labelsArray = new Uint32Array(readBuffer.getMappedRange());

  return {
    centroids: new Float32Array(centroidsBuffer.size / Float32Array.BYTES_PER_ELEMENT),
    labels: labelsArray,
  };
}
