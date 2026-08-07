import { defineConfig } from "vite";
import path from "path";
import { resolve } from 'path';


export default defineConfig({
  base: "/example-apps/html-js/",

  build: {
    outDir: path.resolve(__dirname, "../../docs/static/example-apps/html-js"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        benchmarking: resolve(__dirname, 'benchmarking.html'),
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: 5174,
  },

  preview: {
    host: "0.0.0.0",
    port: 4174,
  },
});
