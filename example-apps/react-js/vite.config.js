import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { exec } from "child_process";
import path from "path";
import fg from "fast-glob";
import fs from "fs";
import { imagetools } from "vite-imagetools";
import generateContributorCreditsPlugin from "./scripts/generate-contributor-credits-json.js";
import VitePluginSitemap from "vite-plugin-sitemap";

export default defineConfig({
  base: "/Img2Num/", // important for GitHub Pages
  server: {
    host: "0.0.0.0", // Allow connections from outside Docker
    port: 5173, // Match docker-compose port
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, '../../packages/js')
      ],
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  resolve: {
    alias: {
      "@pages": path.resolve(__dirname, "src/pages"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@workers": path.resolve(__dirname, "src/workers"),
      "@global-styles": path.resolve(__dirname, "src/global-styles"),
      "@data": path.resolve(__dirname, "src/data"),
    },
  },
  plugins: [
    react(),
    imagetools(),
    VitePluginSitemap({
      hostname: "https://ryan-millard.github.io/Img2Num",
      dynamicRoutes: ["/", "/about", "/credits"],
    }),
    generateContributorCreditsPlugin(),
    // For multithreading (in img2num js package)
    {
      name: "force-security-headers",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          next();
        });
      },
    },
  ],
});
