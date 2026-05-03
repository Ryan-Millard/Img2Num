// src/webgpu/kmeans.ts

export class KMeansWebGPU {
  private device: GPUDevice;
  private pipeline: GPUComputePipeline;
  private bindGroupLayout: GPUBindGroupLayout;
  private maxBufferSize: number;

  constructor(device: GPUDevice) {
    this.device = device;
    this.maxBufferSize = device.limits.maxBufferSize || 2 ** 31 - 1; // Use device max
    this.initPipeline();
  }

  private initPipeline() {
    const shaderCode = `
      struct Uniforms {
        numPixels: u32,
        numClusters: u32,
        width: u32,
        height: u32,
      };

      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @group(0) @binding(1) var<storage, read> pixels: array<f32>;
      @group(0) @binding(2) var<storage, read_write> centroids: array<f32>;
      @group(0) @binding(3) var<storage, read_write> assignments: array<u32>;

      // 16x16 workgroup = 256 threads
      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) id: vec3<u32>) {
        let pixelIndex = id.y * uniforms.width + id.x;
        if (pixelIndex >= uniforms.numPixels) {
          return;
        }

        let pixelR = pixels[pixelIndex * 3];
        let pixelG = pixels[pixelIndex * 3 + 1];
        let pixelB = pixels[pixelIndex * 3 + 2];

        var bestDist = 3.40282347e+38;
        var bestCluster = 0u;

        for (var c = 0u; c < uniforms.numClusters; c = c + 1u) {
          let centroidR = centroids[c * 3];
          let centroidG = centroids[c * 3 + 1];
          let centroidB = centroids[c * 3 + 2];

          let dr = pixelR - centroidR;
          let dg = pixelG - centroidG;
          let db = pixelB - centroidB;
          let dist = dr * dr + dg * dg + db * db;

          if (dist < bestDist) {
            bestDist = dist;
            bestCluster = c;
          }
        }

        assignments[pixelIndex] = bestCluster;
      }
    `;

    const shaderModule = this.device.createShaderModule({
      code: shaderCode,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'uniform' },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'read-only-storage' },
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' },
        },
        {
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout],
    });

    this.pipeline = this.device.createComputePipeline({
      layout: pipelineLayout,
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  async runKMeans(
    pixels: Float32Array,
    width: number,
    height: number,
    numClusters: number,
    maxIterations: number = 10
  ): Promise<Uint32Array> {
    const numPixels = width * height;

    // Create buffers with max supported size
    const pixelsBuffer = this.device.createBuffer({
      size: Math.min(pixels.byteLength, this.maxBufferSize),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(pixelsBuffer.getMappedRange()).set(pixels);
    pixelsBuffer.unmap();

    const centroidsBuffer = this.device.createBuffer({
      size: Math.min(numClusters * 3 * 4, this.maxBufferSize),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
      mappedAtCreation: true,
    });
    // Initialize centroids randomly
    const centroidsArray = new Float32Array(centroidsBuffer.getMappedRange());
    for (let i = 0; i < numClusters; i++) {
      const idx = Math.floor(Math.random() * numPixels);
      centroidsArray[i * 3] = pixels[idx * 3];
      centroidsArray[i * 3 + 1] = pixels[idx * 3 + 1];
      centroidsArray[i * 3 + 2] = pixels[idx * 3 + 2];
    }
    centroidsBuffer.unmap();

    const assignmentsBuffer = this.device.createBuffer({
      size: Math.min(numPixels * 4, this.maxBufferSize),
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const uniformBuffer = this.device.createBuffer({
      size: 16, // 4 u32s
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroup = this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: pixelsBuffer } },
        { binding: 2, resource: { buffer: centroidsBuffer } },
        { binding: 3, resource: { buffer: assignmentsBuffer } },
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const passEncoder = commandEncoder.beginComputePass();

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, bindGroup);

    // Update uniforms
    this.device.queue.writeBuffer(uniformBuffer, 0, new Uint32Array([numPixels, numClusters, width, height]));

    // Dispatch with 16x16 workgroups
    const workgroupCountX = Math.ceil(width / 16);
    const workgroupCountY = Math.ceil(height / 16);
    passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);

    passEncoder.end();

    // Read back assignments
    const readBuffer = this.device.createBuffer({
      size: Math.min(numPixels * 4, this.maxBufferSize),
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });

    commandEncoder.copyBufferToBuffer(assignmentsBuffer, 0, readBuffer, 0, numPixels * 4);
    this.device.queue.submit([commandEncoder.finish()]);

    await readBuffer.mapAsync(GPUMapMode.READ);
    const result = new Uint32Array(readBuffer.getMappedRange()).slice();

    readBuffer.unmap();
    pixelsBuffer.destroy();
    centroidsBuffer.destroy();
    assignmentsBuffer.destroy();
    uniformBuffer.destroy();
    readBuffer.destroy();

    return result;
  }
}
