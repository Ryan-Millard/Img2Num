// src/webgpu/kmeans.ts
export const KMEANS_SHADER = `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> centroids: array<f32>;
@group(0) @binding(2) var<storage, read_write> assignments: array<u32>;
@group(0) @binding(3) var<storage, read_write> clusterSums: array<f32>;
@group(0) @binding(4) var<storage, read_write> clusterCounts: array<u32>;

struct Uniforms {
  numPoints: u32,
  numClusters: u32,
  dimensions: u32,
  totalPoints: u32,
};
@group(0) @binding(5) var<uniform> uniforms: Uniforms;

// 16x16 workgroup = 256 threads, but dispatched in 2D to avoid >65536 limit
@workgroup_size(16, 16)
@compute fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
  @builtin(local_invocation_id) local_id: vec3<u32>,
  @builtin(workgroup_id) workgroup_id: vec3<u32>
) {
  let pointIndex = global_id.x + global_id.y * uniforms.totalPoints;
  if (pointIndex >= uniforms.numPoints) {
    return;
  }

  var minDist = f32(999999.0);
  var bestCluster = u32(0);

  for (var c = u32(0); c < uniforms.numClusters; c++) {
    var dist = f32(0.0);
    for (var d = u32(0); d < uniforms.dimensions; d++) {
      let diff = input[pointIndex * uniforms.dimensions + d] - centroids[c * uniforms.dimensions + d];
      dist += diff * diff;
    }
    if (dist < minDist) {
      minDist = dist;
      bestCluster = c;
    }
  }

  assignments[pointIndex] = bestCluster;

  // Atomic add to cluster sums and counts
  for (var d = u32(0); d < uniforms.dimensions; d++) {
    let val = input[pointIndex * uniforms.dimensions + d];
    atomicAdd(&clusterSums[bestCluster * uniforms.dimensions + d], val);
  }
  atomicAdd(&clusterCounts[bestCluster], 1u);
}
`;

// src/webgpu/device.ts
export async function createWebGPUDevice(): Promise<GPUDevice> {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No WebGPU adapter found');
  }

  // Get maximum buffer size supported by the adapter
  const maxBufferSize = adapter.limits.maxBufferSize;
  
  const device = await adapter.requestDevice({
    requiredLimits: {
      maxBufferSize: maxBufferSize, // Use maximum supported
      maxStorageBufferBindingSize: maxBufferSize,
      maxComputeWorkgroupSizeX: 256,
      maxComputeWorkgroupSizeY: 256,
      maxComputeInvocationsPerWorkgroup: 256,
    }
  });

  return device;
}

// src/webgpu/buffer.ts
export function createLargeBuffer(
  device: GPUDevice,
  size: number,
  usage: GPUBufferUsageFlags,
  label?: string
): GPUBuffer {
  const maxBufferSize = device.limits.maxBufferSize;
  
  if (size > maxBufferSize) {
    throw new Error(
      `Buffer size ${size} exceeds device limit ${maxBufferSize}. ` +
      `Consider splitting into multiple buffers or reducing data size.`
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
  shaderModule: GPUShaderModule,
  bindGroupLayout: GPUBindGroupLayout
): GPUComputePipeline {
  return device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: {
      module: shaderModule,
      entryPoint: 'main',
    },
  });
}

// src/webgpu/dispatch.ts
export function dispatchKMeans(
  passEncoder: GPUComputePassEncoder,
  pipeline: GPUComputePipeline,
  bindGroup: GPUBindGroup,
  numPoints: number,
  workgroupSize: number = 256 // 16x16 = 256
): void {
  // Calculate dispatch dimensions to avoid >65536 limit
  const threadsPerGroup = workgroupSize; // 256
  const totalGroups = Math.ceil(numPoints / threadsPerGroup);
  
  // Use 2D dispatch to keep each dimension under 65536
  const dispatchX = Math.min(totalGroups, 65535);
  const dispatchY = Math.ceil(totalGroups / dispatchX);

  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(dispatchX, dispatchY);
}

// src/webgpu/main.ts
export async function processLargeImage(
  imageData: Float32Array,
  numClusters: number,
  dimensions: number
): Promise<Uint32Array> {
  const device = await createWebGPUDevice();
  
  const numPoints = imageData.length / dimensions;
  const shaderModule = device.createShaderModule({
    code: KMEANS_SHADER,
  });

  // Create buffers with maximum supported size
  const inputBuffer = createLargeBuffer(
    device,
    imageData.byteLength,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    'input_buffer'
  );

  const centroidsBuffer = createLargeBuffer(
    device,
    numClusters * dimensions * Float32Array.BYTES_PER_ELEMENT,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    'centroids_buffer'
  );

  const assignmentsBuffer = createLargeBuffer(
    device,
    numPoints * Uint32Array.BYTES_PER_ELEMENT,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    'assignments_buffer'
  );

  const clusterSumsBuffer = createLargeBuffer(
    device,
    numClusters * dimensions * Float32Array.BYTES_PER_ELEMENT,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    'cluster_sums_buffer'
  );

  const clusterCountsBuffer = createLargeBuffer(
    device,
    numClusters * Uint32Array.BYTES_PER_ELEMENT,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    'cluster_counts_buffer'
  );

  const uniformBuffer = createLargeBuffer(
    device,
    4 * Uint32Array.BYTES_PER_ELEMENT, // 4 uniforms
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    'uniform_buffer'
  );

  // Write data
  device.queue.writeBuffer(inputBuffer, 0, imageData);
  
  // Initialize centroids (simplified - random selection)
  const centroids = new Float32Array(numClusters * dimensions);
  for (let i = 0; i < numClusters; i++) {
    const idx = Math.floor(Math.random() * numPoints);
    for (let d = 0; d < dimensions; d++) {
      centroids[i * dimensions + d] = imageData[idx * dimensions + d];
    }
  }
  device.queue.writeBuffer(centroidsBuffer, 0, centroids);

  // Write uniforms
  const uniforms = new Uint32Array([numPoints, numClusters, dimensions, numPoints]);
  device.queue.writeBuffer(uniformBuffer, 0, uniforms);

  // Create bind group layout
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

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: centroidsBuffer } },
      { binding: 2, resource: { buffer: assignmentsBuffer } },
      { binding: 3, resource: { buffer: clusterSumsBuffer } },
      { binding: 4, resource: { buffer: clusterCountsBuffer } },
      { binding: 5, resource: { buffer: uniformBuffer } },
    ],
  });

  const pipeline = createKMeansPipeline(device, shaderModule, bindGroupLayout);

  // Execute compute pass
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  dispatchKMeans(passEncoder, pipeline, bindGroup, numPoints);
  passEncoder.end();

  // Read back results
  const readBuffer = createLargeBuffer(
    device,
    assignmentsBuffer.size,
    GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    'read_buffer'
  );

  commandEncoder.copyBufferToBuffer(assignmentsBuffer, 0, readBuffer, 0, assignmentsBuffer.size);
  device.queue.submit([commandEncoder.finish()]);

  await readBuffer.mapAsync(GPUMapMode.READ);
  const result = new Uint32Array(readBuffer.getMappedRange());
  const assignments = new Uint32Array(result);
  readBuffer.unmap();

  // Cleanup
  inputBuffer.destroy();
  centroidsBuffer.destroy();
  assignmentsBuffer.destroy();
  clusterSumsBuffer.destroy();
  clusterCountsBuffer.destroy();
  uniformBuffer.destroy();
  readBuffer.destroy();
  device.destroy();

  return assignments;
}
