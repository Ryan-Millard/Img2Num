// pnpm symlinks the workspace dep, and static servers won't follow that out of
// the doc root. Copy the artifact in so the page is genuinely standalone.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const pkgRoot = path.dirname(require.resolve("img2num/package.json"));
const src = path.join(pkgRoot, "dist/standalone/img2num.iife.js");

if (!existsSync(src)) {
  console.error(`Missing ${src}. Build the library first.`);
  process.exit(1);
}

// Go up 1 dir since `scripts/` is a subfolder relative to project root
const rootDir = path.resolve(import.meta.dirname, "..");

mkdirSync(path.join(rootDir, "lib"), { recursive: true });
copyFileSync(src, path.join(rootDir, "lib/img2num.iife.js"));
console.log("Copied img2num.iife.js");
