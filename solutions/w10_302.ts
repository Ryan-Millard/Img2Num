// src/webgpu/kmeans.ts

export class KMeansWebGPU {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private bindGroupLayout: GPUBindGroupLayout;

  constructor(device: GPUDevice) {
    this.device = device;
    
    // Increase max buffer size to device limit
    const maxBufferSize = device.limits.maxBufferSize;
    
    this.bindGroupLayout = device.createBindGroupLayout({
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

    const shaderModule = device.createShaderModule({
      code: `
        struct Uniforms {
          numPoints: u32,
          numClusters: u32,
          dimensions: u32,
        };

        @group(0) @binding(0) var<storage, read> points: array<f32>;
        @group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
        @group(0) @binding(2) var<uniform> uniforms: Uniforms;

        // 16x16 workgroup size to prevent >65536 workers
        @compute @workgroup_size(16, 16)
        fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
          let pointIndex = global_id.x;
          let dimension = global_id.y;
          
          if (pointIndex >= uniforms.numPoints || dimension >= uniforms.dimensions) {
            return;
          }

          // Find nearest centroid
          var minDist: f32 = 1e10;
          var nearestCluster: u32 = 0;
          
          for (var c: u32 = 0u; c < uniforms.numClusters; c++) {
            var dist: f32 = 0.0;
            for (var d: u32 = 0u; d < uniforms.dimensions; d++) {
              let diff = points[pointIndex * uniforms.dimensions + d] - 
                        centroids[c * uniforms.dimensions + d];
              dist += diff * diff;
            }
            if (dist < minDist) {
              minDist = dist;
              nearestCluster = c;
            }
          }

          // Assign point to nearest centroid
          centroids[pointIndex * uniforms.dimensions + dimension] = f32(nearestCluster);
        }
      `
    });

    this.pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout]
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main'
      }
    });
  }

  async runKMeans(
    points: Float32Array,
    numClusters: number,
    dimensions: number
  ): Promise<Uint32Array> {
    const numPoints = points.length / dimensions;
    
    // Use device max buffer size
    const maxBufferSize = this.device.limits.maxBufferSize;
    
    // Create storage buffers with maximum allowed size
    const pointsBuffer = this.device.createBuffer({
      size: Math.min(points.byteLength, maxBufferSize),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Float32Array(pointsBuffer.getMappedRange()).set(points);
    pointsBuffer.unmap();

    const centroidsBuffer = this.device.createBuffer({
      size: Math.min(numClusters * dimensions * Float32Array.BYTES_PER_ELEMENT, maxBufferSize),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    // Initialize centroids with random points
    const centroidData = new Float32Array(centroidsBuffer.getMappedRange());
    for (let i = 0; i < numClusters; i++) {
      const idx = Math.floor(Math.random() * numPoints);
      for (let d = 0; d < dimensions; d++) {
        centroidData[i * dimensions + d] = points[idx * dimensions + d];
      }
    }
    centroidsBuffer.unmap();

    const uniformBuffer = this.device.createBuffer({
      size: 12, // 3 u32 values
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Uint32Array(uniformBuffer.getMappedRange()).set([numPoints, numClusters, dimensions]);
    uniformBuffer.unmap();

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: pointsBuffer } },
        { binding: 1, resource: { buffer: centroidsBuffer } },
        { binding: 2, resource: { buffer: uniformBuffer } }
      ]
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    
    // Dispatch with 16x16 workgroup size
    const workgroupCountX = Math.ceil(numPoints / 16);
    const workgroupCountY = Math.ceil(dimensions / 16);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
    passEncoder.end();

    // Read back results
    const resultBuffer = this.device.createBuffer({
      size: numPoints * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    
    commandEncoder.copyBufferToBuffer(
      centroidsBuffer, 0,
      resultBuffer, 0,
      numPoints * Uint32Array.BYTES_PER_ELEMENT
    );

    this.device.queue.submit([commandEncoder.finish()]);

    await resultBuffer.mapAsync(GPUMapMode.READ);
    const result = new Uint32Array(resultBuffer.getMappedRange()).slice();
    resultBuffer.unmap();

    // Cleanup
    pointsBuffer.destroy();
    centroidsBuffer.destroy();
    uniformBuffer.destroy();
    resultBuffer.destroy();

    return result;
  }
}
