const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

// add node.js support for webgpu
if (isNode) {
    const { create, globals } = await import("webgpu");
    
    const nativeGpu = create(['backend=vulkan']);
    globalThis.navigator.gpu = nativeGpu;
}

export default isNode;
