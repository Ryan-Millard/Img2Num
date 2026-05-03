// src/webgpu/kmeans.ts
import { WebGPUContext } from './context';

const MAX_BUFFER_SIZE = 2_147_483_648; // 2GB - max supported by WebGPU

export class KMeansGPU {
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
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'read-only-storage' }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' }
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' }
        }
      ]
    });
  }

  private createPipeline(): GPUComputePipeline {
    const shaderModule = this.device.createShaderModule({
      code: `
        struct Uniforms {
          numPoints: u32,
          numClusters: u32,
          dimensions: u32,
          maxIterations: u32,
        };

        @group(0) @binding(0) var<storage, read> points: array<f32>;
        @group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
        @group(0) @binding(2) var<uniform> uniforms: Uniforms;

        // 16x16 workgroup = 256 threads total
        @compute @workgroup_size(16, 16)
        fn main(@builtin(global_invocation_id) id: vec3<u32>) {
          let pointIndex = id.x;
          let clusterIndex = id.y;
          
          if (pointIndex >= uniforms.numPoints || clusterIndex >= uniforms.numClusters) {
            return;
          }

          // Calculate distance between point and centroid
          var dist = 0.0;
          for (var d = 0u; d < uniforms.dimensions; d++) {
            let diff = points[pointIndex * uniforms.dimensions + d] - 
                       centroids[clusterIndex * uniforms.dimensions + d];
            dist += diff * diff;
          }

          // Store distance for reduction
          // Using atomic operations for simplicity
          let outputIndex = pointIndex * uniforms.numClusters + clusterIndex;
          centroids[outputIndex] = dist;
        }
      `
    });

    return this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout]
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main'
      }
    });
  }

  async compute(
    points: Float32Array,
    numClusters: number,
    dimensions: number,
    maxIterations: number = 100
  ): Promise<Float32Array> {
    const numPoints = points.length / dimensions;
    
    // Create buffers with max size support
    const pointsBuffer = this.createBuffer(points, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
    const centroidsBuffer = this.createBuffer(
      new Float32Array(numClusters * dimensions),
      GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    );
    
    const uniformData = new Uint32Array([numPoints, numClusters, dimensions, maxIterations]);
    const uniformBuffer = this.createBuffer(uniformData, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);

    // Initialize centroids (k-means++ initialization)
    await this.initializeCentroids(pointsBuffer, centroidsBuffer, numPoints, numClusters, dimensions);

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: pointsBuffer } },
        { binding: 1, resource: { buffer: centroidsBuffer } },
        { binding: 2, resource: { buffer: uniformBuffer } }
      ]
    });

    // Dispatch with 16x16 workgroups
    const workgroupCountX = Math.ceil(numPoints / 16);
    const workgroupCountY = Math.ceil(numClusters / 16);

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();

    // Read back results
    const resultBuffer = this.device.createBuffer({
      size: centroidsBuffer.size,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });
    
    commandEncoder.copyBufferToBuffer(centroidsBuffer, 0, resultBuffer, 0, centroidsBuffer.size);
    this.device.queue.submit([commandEncoder.finish()]);

    await resultBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(resultBuffer.getMappedRange());
    const output = new Float32Array(result);
    resultBuffer.unmap();

    // Cleanup
    pointsBuffer.destroy();
    centroidsBuffer.destroy();
    uniformBuffer.destroy();
    resultBuffer.destroy();

    return output;
  }

  private createBuffer(data: ArrayBufferView, usage: GPUBufferUsageFlags): GPUBuffer {
    const size = Math.min(data.byteLength, MAX_BUFFER_SIZE);
    const buffer = this.device.createBuffer({
      size,
      usage,
      mappedAtCreation: true
    });
    
    new Uint8Array(buffer.getMappedRange()).set(new Uint8Array(data.buffer, data.byteOffset, size));
    buffer.unmap();
    
    return buffer;
  }

  private async initializeCentroids(
    pointsBuffer: GPUBuffer,
    centroidsBuffer: GPUBuffer,
    numPoints: number,
    numClusters: number,
    dimensions: number
  ): Promise<void> {
    // Simple random initialization for now
    const initData = new Float32Array(numClusters * dimensions);
    for (let i = 0; i < numClusters; i++) {
      const pointIndex = Math.floor(Math.random() * numPoints);
      const offset = pointIndex * dimensions;
      for (let d = 0; d < dimensions; d++) {
        initData[i * dimensions + d] = (await this.readBuffer(pointsBuffer, offset + d, 1))[0];
      }
    }
    
    this.device.queue.writeBuffer(centroidsBuffer, 0, initData);
  }

  private async readBuffer(buffer: GPUBuffer, offset: number, size: number): Promise<Float32Array> {
    const stagingBuffer = this.device.createBuffer({
      size: size * 4,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });
    
    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, offset * 4, stagingBuffer, 0, size * 4);
    this.device.queue.submit([commandEncoder.finish()]);
    
    await stagingBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(stagingBuffer.getMappedRange());
    const output = new Float32Array(result);
    stagingBuffer.unmap();
    stagingBuffer.destroy();
    
    return output;
  }
}
