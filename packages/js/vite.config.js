import { defineConfig } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const __TARGET__ = process.env.TARGET ?? "browser";

  const isNode = __TARGET__ === "node";

  return {
    // Set the environment for Vite
    ...(isNode && { ssr: { target: "node" } }),
    base: "./",

    build: {
      base: "./",
      outDir: `dist/${__TARGET__}`,
      publicDir: "src/workers",
      assetsDir: "assets",
      emptyOutDir: true,
      ...(isNode && { target: "node18" }),

      lib: {
        entry: "src/index.js",
        formats: ["es"]
      },

      rollupOptions: {
        external: isNode
        ? [
          "node:worker_threads", "worker_threads",
          "node:path", "path",
          "node:url", "url",
          "webgpu"
        ]
        : []
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
