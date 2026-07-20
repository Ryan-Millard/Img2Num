import { defineConfig } from "vite";
import path from "path";

export default defineConfig(() => {
  const __TARGET__ = process.env.TARGET ?? "browser";
  const isNode = __TARGET__ === "node";

  return {
    base: "./",
    plugins: [],

    // NATIVE COPIER: Copies index.wasm into dist/<target>/ automatically.
    publicDir: "build-wasm",

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

      lib: {
        entry: "src/index.js",
        formats: ["es"],
      },

      rollupOptions: {
        external: isNode ? ["node:webgpu", "webgpu", "node:module", "module"] : [],
        output: isNode ? { entryFileNames: "img2num.js" } : {},
      },
    },

    define: {
      __TARGET__: JSON.stringify(__TARGET__),
    },

    resolve: {
      alias: {
        "@__TARGET__": path.resolve(__dirname, `./src/target/${__TARGET__}`),
        "@wasm": path.resolve(__dirname, "./build-wasm"),
      },
    },
  };
});
