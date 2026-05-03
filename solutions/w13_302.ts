// src/webgpu/kmeans.ts

export class KMeansWebGPU {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private bindGroupLayout: GPUBindGroupLayout;

  constructor(device: GPUDevice) {
    this.device = device;
    this.bindGroupLayout = this.createBindGroupLayout();
    this.pipeline = this.createPipeline();
  }

  private createBindGroupLayout(): GPUBindGroupLayout {
    return this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' }
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

          // Calculate distance from point to centroid
          var dist = 0.0;
          for (var d = 0u; d < uniforms.dimensions; d++) {
            let diff = points[pointIndex * uniforms.dimensions + d] - 
                       centroids[clusterIndex * uniforms.dimensions + d];
            dist += diff * diff;
          }

          // Store distance for reduction (simplified - actual implementation would use atomics)
          // This is a placeholder for the actual distance computation
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

  async initialize(maxBufferSize?: number): Promise<void> {
    const adapter = await navigator.gpu.requestAdapter();
    
    // Request maximum buffer size supported by the device
    const requestedSize = maxBufferSize || 
      (adapter?.limits.maxBufferSize || 256 * 1024 * 1024); // Default to 256MB if not available
    
    this.device = await adapter!.requestDevice({
      requiredLimits: {
        maxBufferSize: requestedSize,
        maxComputeWorkgroupSizeX: 256,
        maxComputeWorkgroupSizeY: 256,
        maxComputeInvocationsPerWorkgroup: 256
      }
    });

    this.pipeline = this.createPipeline();
  }

  async runKMeans(
    points: Float32Array,
    numClusters: number,
    dimensions: number
  ): Promise<Float32Array> {
    const numPoints = points.length / dimensions;
    
    // Create storage buffers with maximum supported size
    const pointsBuffer = this.device.createBuffer({
      size: points.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });
    
    // Calculate centroid buffer size (ensure it's within limits)
    const centroidSize = numClusters * dimensions * Float32Array.BYTES_PER_ELEMENT;
    const centroidsBuffer = this.device.createBuffer({
      size: centroidSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      mappedAtCreation: false
    });

    const uniformBuffer = this.device.createBuffer({
      size: 12, // 3 x u32
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });

    // Initialize centroids (simplified - random selection)
    const initialCentroids = new Float32Array(numClusters * dimensions);
    for (let i = 0; i < numClusters; i++) {
      const idx = Math.floor(Math.random() * numPoints);
      for (let d = 0; d < dimensions; d++) {
        initialCentroids[i * dimensions + d] = points[idx * dimensions + d];
      }
    }

    // Write data to buffers
    this.device.queue.writeBuffer(pointsBuffer, 0, points);
    this.device.queue.writeBuffer(centroidsBuffer, 0, initialCentroids);
    this.device.queue.writeBuffer(uniformBuffer, 0, new Uint32Array([
      numPoints, numClusters, dimensions
    ]));

    // Create bind group
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

    // Read back centroids
    const readBuffer = this.device.createBuffer({
      size: centroidSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      mappedAtCreation: false
    });

    commandEncoder.copyBufferToBuffer(centroidsBuffer, 0, readBuffer, 0, centroidSize);
    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(readBuffer.getMappedRange());
    const centroids = new Float32Array(result);
    readBuffer.unmap();

    // Cleanup
    pointsBuffer.destroy();
    centroidsBuffer.destroy();
    uniformBuffer.destroy();
    readBuffer.destroy();

    return centroids;
  }
}
