import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { imagetools } from "vite-imagetools";
import generateContributorCreditsPlugin from "./scripts/generate-contributor-credits-json.js";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/Img2Num/example-apps/react-js/", // important for GitHub Pages
  server: {
    host: "0.0.0.0", // Allow connections from outside Docker
    port: 5173, // Match docker-compose port
  },

  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "src/pages"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@global-styles": path.resolve(__dirname, "src/global-styles"),
      "@data": path.resolve(__dirname, "src/data"),
    },
  },
  plugins: [react(), imagetools(), generateContributorCreditsPlugin(), svgr()],
  worker: {
    format: "es", // Keeps your top-level awaits working
  },
  build: {
    target: "esnext",
    rollupOptions: {
      // Tells the bundler to ignore these when building for the web browser
      external: ["webgpu", "worker_threads", "url", "path", "fs"],
    },
    outDir: "../../docs/static/example-apps/react-js",
  },
});
