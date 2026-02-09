import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { imagetools } from "vite-imagetools";
import generateContributorCreditsPlugin from "./scripts/generate-contributor-credits-json.js";
import VitePluginSitemap from "vite-plugin-sitemap";

export default defineConfig({
  base: "/Img2Num/", // important for GitHub Pages
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
  plugins: [
    react(),
    imagetools(),
    VitePluginSitemap({
      hostname: "https://ryan-millard.github.io/Img2Num",
      dynamicRoutes: ["/", "/credits"],
    }),
    generateContributorCreditsPlugin(),
  ],
});
