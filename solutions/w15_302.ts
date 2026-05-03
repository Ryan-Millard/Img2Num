// src/webgpu/kmeans.ts
import { WebGPUContext } from './context';

const KMEANS_SHADER = `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
@group(0) @binding(2) var<storage, read_write> assignments: array<u32>;
@group(0) @binding(3) var<storage, read_write> distances: array<f32>;

struct Uniforms {
  numPoints: u32,
  numClusters: u32,
  dimensions: u32,
  totalWorkItems: u32,
};
@group(0) @binding(4) var<uniform> uniforms: Uniforms;

// 16x16 workgroup = 256 threads total, but dispatched as 2D to avoid >65536 limit
@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x + id.y * uniforms.totalWorkItems;
  if (index >= uniforms.numPoints) { return; }

  var minDist = 1e10f;
  var bestCluster = 0u;
  let base = index * uniforms.dimensions;

  for (var c = 0u; c < uniforms.numClusters; c = c + 1u) {
    var dist = 0.0f;
    let cBase = c * uniforms.dimensions;
    for (var d = 0u; d < uniforms.dimensions; d = d + 1u) {
      let diff = input[base + d] - centroids[cBase + d];
      dist = dist + diff * diff;
    }
    if (dist < minDist) {
      minDist = dist;
      bestCluster = c;
    }
  }

  assignments[index] = bestCluster;
  distances[index] = minDist;
}
`;

export class KMeansWebGPU {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private bindGroupLayout: GPUBindGroupLayout;

  constructor(private context: WebGPUContext) {
    this.device = context.device;
    this.bindGroupLayout = this.createBindGroupLayout();
    this.pipeline = this.createPipeline();
  }

  private createBindGroupLayout(): GPUBindGroupLayout {
    return this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });
  }

  private createPipeline(): GPUComputePipeline {
    const shaderModule = this.device.createShaderModule({
      code: KMEANS_SHADER,
    });

    return this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  async run(
    inputData: Float32Array,
    numClusters: number,
    dimensions: number
  ): Promise<{ assignments: Uint32Array; centroids: Float32Array }> {
    const numPoints = inputData.length / dimensions;

    // Use maximum supported buffer size
    const maxBufferSize = this.device.limits.maxBufferSize;
    const requiredSize = Math.max(
      inputData.byteLength,
      numClusters * dimensions * 4,
      numPoints * 4,
      numPoints * 4
    );

    if (requiredSize > maxBufferSize) {
      throw new Error(`Required buffer size ${requiredSize} exceeds device limit ${maxBufferSize}`);
    }

    // Create buffers with max supported size
    const inputBuffer = this.device.createBuffer({
      size: maxBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(inputBuffer.getMappedRange(0, inputData.byteLength)).set(inputData);
    inputBuffer.unmap();

    const centroidsBuffer = this.device.createBuffer({
      size: maxBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true,
    });
    // Initialize centroids with random points
    const centroidsData = new Float32Array(numClusters * dimensions);
    for (let i = 0; i < numClusters; i++) {
      const idx = Math.floor(Math.random() * numPoints);
      for (let d = 0; d < dimensions; d++) {
        centroidsData[i * dimensions + d] = inputData[idx * dimensions + d];
      }
    }
    new Float32Array(centroidsBuffer.getMappedRange(0, centroidsData.byteLength)).set(centroidsData);
    centroidsBuffer.unmap();

    const assignmentsBuffer = this.device.createBuffer({
      size: maxBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const distancesBuffer = this.device.createBuffer({
      size: maxBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const uniformBuffer = this.device.createBuffer({
      size: 16, // 4 u32s
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Dispatch with 16x16 workgroups to avoid >65536 limit
    const workgroupSize = 16;
    const workgroupCountX = Math.ceil(Math.sqrt(numPoints));
    const workgroupCountY = Math.ceil(numPoints / workgroupCountX);

    this.device.queue.writeBuffer(uniformBuffer, 0, new Uint32Array([
      numPoints,
      numClusters,
      dimensions,
      workgroupCountX * workgroupSize,
    ]));

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: inputBuffer } },
        { binding: 1, resource: { buffer: centroidsBuffer } },
        { binding: 2, resource: { buffer: assignmentsBuffer } },
        { binding: 3, resource: { buffer: distancesBuffer } },
        { binding: 4, resource: { buffer: uniformBuffer } },
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();

    // Read back results
    const readBuffer = this.device.createBuffer({
      size: maxBufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    commandEncoder.copyBufferToBuffer(assignmentsBuffer, 0, readBuffer, 0, numPoints * 4);
    commandEncoder.copyBufferToBuffer(centroidsBuffer, 0, readBuffer, numPoints * 4, numClusters * dimensions * 4);

    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const resultData = readBuffer.getMappedRange();

    const assignments = new Uint32Array(resultData.slice(0, numPoints * 4));
    const centroids = new Float32Array(resultData.slice(numPoints * 4, numPoints * 4 + numClusters * dimensions * 4));

    readBuffer.unmap();

    // Cleanup
    inputBuffer.destroy();
    centroidsBuffer.destroy();
    assignmentsBuffer.destroy();
    distancesBuffer.destroy();
    uniformBuffer.destroy();
    readBuffer.destroy();

    return { assignments, centroids };
  }
}
