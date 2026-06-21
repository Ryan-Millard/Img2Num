import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const __TARGET__ = process.env.TARGET ?? "browser";
  const isNode = __TARGET__ === "node";

  return {
    base: "./",
    plugins: [],
    
    // NATIVE COPIER: Copies index.wasm into dist/node/ automatically
    publicDir: isNode ? "build-wasm" : "src/workers",

    build: {
      base: "./",
      outDir: `dist/${__TARGET__}`,
      assetsDir: ".", 
      emptyOutDir: true,
      
      // 1. CRITICAL: This tells the production bundler to preserve 
      // native Node subsystems (like 'module' and 'fs') instead of shimming them for the web.
      ssr: isNode, 
      ...(isNode && { target: "node18" }),

      minify: !isNode, 

      lib: isNode 
        ? {
            entry: {
              img2num: "src/index.js",
              wasmWorker: "src/workers/wasmWorker.js"
            },
            formats: ["es"],
            fileName: (format, entryName) => `${entryName}.js`
          }
        : {
            entry: "src/index.js",
            formats: ["es"]
          },

      rollupOptions: {
        external: isNode
          ? [
              "node:worker_threads", "worker_threads",
              "node:path", "path",
              "node:url", "url",
              "node:webgpu", "webgpu",
              "node:module", "module"
            ]
          : [],
        
        output: isNode 
          ? {
              manualChunks(id) {
                if (id.includes('build-wasm')) {
                  return 'wasmWorker';
                }
              },
              assetFileNames: "[name][extname]"
            }
          : {}
      }
    },

    define: {
      __TARGET__: JSON.stringify(__TARGET__)
    },

    resolve: {
      alias: {
        "@__TARGET__": path.resolve(__dirname, `./src/target/${__TARGET__}`),
        "@wasm": path.resolve(__dirname, "./build-wasm"),
        "@workers": path.resolve(__dirname, "./src/workers")
      },
    },

    worker: {
      format: "es",
    },
  };
});