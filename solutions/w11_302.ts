// src/webgpu/kmeans.ts
export const KMEANS_SHADER = `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
@group(0) @binding(2) var<storage, read_write> assignments: array<u32>;
@group(0) @binding(3) var<storage, read_write> counts: array<u32>;
@group(0) @binding(4) var<storage, read_write> sums: array<f32>;

struct Uniforms {
  numPoints: u32,
  numCentroids: u32,
  dimensions: u32,
};
@group(0) @binding(5) var<uniform> uniforms: Uniforms;

// 16x16 workgroup = 256 threads total, but dispatched as 2D grid
@workgroup_size(16, 16)
@compute
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let pointIndex = global_id.x + global_id.y * uniforms.numPoints;
  if (pointIndex >= uniforms.numPoints) {
    return;
  }

  var minDist = f32(3.40282347e+38);
  var bestCentroid = 0u;

  for (var c = 0u; c < uniforms.numCentroids; c = c + 1u) {
    var dist = 0.0;
    for (var d = 0u; d < uniforms.dimensions; d = d + 1u) {
      let diff = input[pointIndex * uniforms.dimensions + d] - centroids[c * uniforms.dimensions + d];
      dist = dist + diff * diff;
    }
    if (dist < minDist) {
      minDist = dist;
      bestCentroid = c;
    }
  }

  assignments[pointIndex] = bestCentroid;
  atomicAdd(&counts[bestCentroid], 1u);
  for (var d = 0u; d < uniforms.dimensions; d = d + 1u) {
    atomicAdd(&sums[bestCentroid * uniforms.dimensions + d], u32(input[pointIndex * uniforms.dimensions + d] * 1000.0));
  }
}
`;

// src/webgpu/device.ts
export async function getWebGPUDevice(): Promise<GPUDevice> {
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
      maxComputeWorkgroupSizeX: 256,
      maxComputeWorkgroupSizeY: 256,
      maxComputeInvocationsPerWorkgroup: 256,
    },
  });

  return device;
}

// src/webgpu/buffer.ts
export function createBuffer(
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags,
  mappedAtCreation: boolean = false
): GPUBuffer {
  const maxSize = device.limits.maxBufferSize;
  if (size > maxSize) {
    throw new Error(`Buffer size ${size} exceeds device limit ${maxSize}`);
  }

  return device.createBuffer({
    size,
    usage,
    mappedAtCreation,
  });
}

// src/webgpu/pipeline.ts
export function createKMeansPipeline(
  device: GPUDevice,
  shaderModule: GPUShaderModule
): GPUComputePipeline {
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  return device.createComputePipeline({
    layout: pipelineLayout,
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });
}

// src/webgpu/kmeans-runner.ts
export class KMeansRunner {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private shaderModule: GPUShaderModule;

  constructor(device: GPUDevice) {
    this.device = device;
    this.shaderModule = device.createShaderModule({
      code: KMEANS_SHADER,
    });
    this.pipeline = createKMeansPipeline(device, this.shaderModule);
  }

  async run(
    inputData: Float32Array,
    numCentroids: number,
    dimensions: number,
    maxIterations: number = 100
  ): Promise<Uint32Array> {
    const numPoints = inputData.length / dimensions;
    const inputSize = inputData.byteLength;
    const centroidsSize = numCentroids * dimensions * 4;
    const assignmentsSize = numPoints * 4;
    const countsSize = numCentroids * 4;
    const sumsSize = numCentroids * dimensions * 4;
    const uniformSize = 12; // 3 u32s

    // Create buffers with maximum supported size
    const inputBuffer = createBuffer(
      this.device,
      inputSize,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    );
    this.device.queue.writeBuffer(inputBuffer, 0, inputData);

    const centroidsBuffer = createBuffer(
      this.device,
      centroidsSize,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    );

    const assignmentsBuffer = createBuffer(
      this.device,
      assignmentsSize,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    );

    const countsBuffer = createBuffer(
      this.device,
      countsSize,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    );

    const sumsBuffer = createBuffer(
      this.device,
      sumsSize,
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    );

    const uniformBuffer = createBuffer(
      this.device,
      uniformSize,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    );

    // Initialize centroids (random selection)
    const centroids = new Float32Array(numCentroids * dimensions);
    for (let i = 0; i < numCentroids; i++) {
      const idx = Math.floor(Math.random() * numPoints);
      for (let d = 0; d < dimensions; d++) {
        centroids[i * dimensions + d] = inputData[idx * dimensions + d];
      }
    }
    this.device.queue.writeBuffer(centroidsBuffer, 0, centroids);

    // Write uniforms
    const uniforms = new Uint32Array([numPoints, numCentroids, dimensions]);
    this.device.queue.writeBuffer(uniformBuffer, 0, uniforms);

    const bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: centroidsBuffer } },
        { binding: 2, resource: { buffer: assignmentsBuffer } },
        { binding: 3, resource: { buffer: countsBuffer } },
        { binding: 4, resource: { buffer: sumsBuffer } },
        { binding: 5, resource: { buffer: uniformBuffer } },
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);

    // Dispatch with 16x16 workgroups to keep total workers under 65536
    const workgroupSizeX = 16;
    const workgroupSizeY = 16;
    const dispatchX = Math.ceil(numPoints / workgroupSizeX);
    const dispatchY = Math.ceil(1 / workgroupSizeY); // Only need 1 row for 1D data
    passEncoder.dispatchWorkgroups(dispatchX, dispatchY);
    passEncoder.end();

    // Read back assignments
    const readBuffer = createBuffer(
      this.device,
      assignmentsSize,
      GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    );
    commandEncoder.copyBufferToBuffer(assignmentsBuffer, 0, readBuffer, 0, assignmentsSize);

    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const result = new Uint32Array(readBuffer.getMappedRange());
    const assignments = new Uint32Array(result);
    readBuffer.unmap();

    return assignments;
  }
}
