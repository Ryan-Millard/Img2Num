// pnpm symlinks the workspace dep, and static servers won't follow that out of
// the doc root. Copy the artifact in so the page is genuinely standalone.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const pkgRoot = path.dirname(require.resolve("img2num/package.json"));
// Go up 1 dir since `scripts/` is a subfolder relative to project root
const rootDir = path.resolve(import.meta.dirname, "..");
const libDir = path.join(rootDir, "lib");

mkdirSync(libDir, { recursive: true });

for (const [from, to] of [
  [path.join(pkgRoot, "dist/standalone/img2num.umd.js"), "img2num.umd.js"],
  [require.resolve("requirejs/require.js"), "require.js"],
]) {
  if (!existsSync(from)) {
    console.error(`Missing ${from}`);
    process.exit(1);
  }

  copyFileSync(from, path.join(libDir, to));
}

console.log("Copied img2num.umd.js + require.js");
