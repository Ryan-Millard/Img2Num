import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { imagetools } from "vite-imagetools";
import generateContributorCreditsPlugin from "./scripts/generate-contributor-credits-json.js";
import svgr from "vite-plugin-svgr";

const dirname = import.meta.dirname;
const alias = Object.fromEntries(
  ["pages", "assets", "components", "utils", "hooks", "global-styles", "data"]
    .map((d) => [`@${d}`, path.resolve(import.meta.dirname, `src/${d}`)])
);

export default defineConfig({
  base: "/example-apps/react-js/", // important for GitHub Pages
  server: {
    host: "0.0.0.0", // Allow connections from outside Docker
    port: 5173, // Match docker-compose port
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },

  resolve: {
    alias
  },
  plugins: [react(), imagetools(), generateContributorCreditsPlugin(), svgr()],
  worker: {
    format: "es", // Keeps your top-level awaits working
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        // Split libraries into chunks separate from index
        codeSplitting: {
          groups: [
            { name: "react-vendor", test: /node_modules[\\/](react|react-dom|react-router)/ },
            { name: "img2num", test: /packages[\\/]js[\\/]dist|node_modules[\\/]img2num/ },
          ],
        },
      },
    },
    outDir: "../../docs/static/example-apps/react-js",
  },
});
