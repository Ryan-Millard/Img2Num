/**
 * Build the Img2Num example apps from template.html + variants/<name>/variant.json.
 *
 * Usage:
 *   node scripts/build.mjs                  Build all variants into dist/<name>/
 *   node scripts/build.mjs iife             Build one variant into dist/iife/
 *   node scripts/build.mjs --deploy         Build all variants into ../../docs/static/example-apps/<outputName>/
 *   node scripts/build.mjs iife --deploy    Build one variant into the docs static dir
 *
 * Each output is fully self-contained: index.html + shared/ + lib/.
 * pnpm symlinks the workspace dep and static servers won't follow that out of
 * the doc root, so library artifacts are copied in rather than referenced.
 */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const rootDir = path.resolve(import.meta.dirname, "..");
const variantsDir = path.join(rootDir, "variants");
const deployBase = path.resolve(rootDir, "../../docs/static/example-apps");

const args = process.argv.slice(2);
const deploy = args.includes("--deploy");
const requested = args.filter((a) => a !== "--deploy");

const available = readdirSync(variantsDir).filter((d) => statSync(path.join(variantsDir, d)).isDirectory());
const names = requested.length > 0 ? requested : available;

for (const name of names) {
  if (!available.includes(name)) {
    console.error(`Unknown variant "${name}". Available: ${available.join(", ")}`);
    process.exit(1);
  }
}

const template = readFileSync(path.join(rootDir, "template.html"), "utf8");

/** Find a package's root directory without requiring `exports` to expose package.json. */
function packageRoot(name) {
  // `require.resolve(`${name}/package.json`)` throws ERR_PACKAGE_PATH_NOT_EXPORTED
  // when the package's `exports` map doesn't list "./package.json", so resolve the
  // entry point instead and walk up to the package.json that names this package.
  let dir = path.dirname(require.resolve(name));
  while (true) {
    const candidate = path.join(dir, "package.json");
    if (existsSync(candidate) && JSON.parse(readFileSync(candidate, "utf8")).name === name) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`Could not locate package root for "${name}"`);
    dir = parent;
  }
}

/** Resolve a lib entry's source path inside the given package. */
function resolveLibSource(lib) {
  return path.join(packageRoot(lib.package), lib.from);
}

function escapeHtml(s) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function dedent(s) {
  const lines = s.split("\n");
  const indents = lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const trim = Math.min(...indents, Infinity);
  return [lines[0], ...lines.slice(1).map((l) => l.slice(trim))].join("\n");
}

const img2numVersion = execSync(`pnpm view img2num version`, { encoding: "utf8" }).trim();
function renderLoader(variant, { cdn }) {
  return variant.loader
    .replaceAll("{{LIB_URL}}", cdn ? variant.libUrlCdn : variant.libUrl)
    .replaceAll("{{REQUIRE_URL}}", cdn ? (variant.requireUrlCdn ?? "") : (variant.requireUrl ?? ""))
    .replaceAll("{{VERSION}}", img2numVersion);
}

function buildVariant(name) {
  const variant = JSON.parse(readFileSync(path.join(variantsDir, name, "variant.json"), "utf8"));

  const outDir = deploy ? path.join(deployBase, variant.outputName) : path.join(rootDir, "dist", name);

  // Clean output
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const appJs = readFileSync(path.join(rootDir, "shared", "app.js"), "utf8");
  const appCode = appJs.trim().split("\n").map(line => "  ".repeat(variant.appCodeIndentLevel) + line).join("\n");
  const loaderExecutable = renderLoader(variant, { cdn: false }).replaceAll("{{APP_CODE}}", appCode);
  const temp =
`<label id="dropZone" class="dropzone" for="fileInput" tabindex="0">
  <span id="uploadHelp">Drag &amp; drop an image here, paste one (Ctrl+V), or&nbsp;</span>
  <input
    type="file"
    id="fileInput"
    aria-describedby="uploadHelp"
    accept=".png,.jpg,.jpeg,.gif,.bmp,.webp,.avif,image/png,image/jpeg,image/gif,image/bmp,image/webp,image/avif"
  />
</label>
<img id="originalImg" alt="" />
<div id="spinner" class="spinner"></div>
<img id="previewImg" alt="" />

`;
  const loaderDisplay = escapeHtml(
    temp + renderLoader(variant, { cdn: true }).replaceAll("{{APP_CODE}}", appCode)
  );
  const generatedComment = "<!-- Generated from example-apps/html-js/template.html " +
    "— do not edit the built copy directly. -->";

  // 1. index.html from template
  const canonical = `https://img2num.dev/example-apps/${variant.outputName}/`;
  const html = template
    .replaceAll("{{TITLE}}", variant.title)
    .replaceAll("{{OUTPUT_NAME}}", variant.outputName.toUpperCase())
    .replaceAll("{{DESCRIPTION}}", variant.description)
    .replaceAll("{{CANONICAL}}", canonical)
    .replaceAll("{{HEADING}}", variant.heading)
    .replaceAll("{{INTRO}}", variant.intro)
    .replaceAll("{{LOADER_EXECUTABLE}}", loaderExecutable)
    .replaceAll("{{LOADER_DISPLAY}}", loaderDisplay)
    .replaceAll(generatedComment, "");

  const leftover = html.match(/\{\{[A-Z_]+\}\}/);
  if (leftover) {
    console.error(`Unsubstituted placeholder ${leftover[0]} in template (variant "${name}").`);
    process.exit(1);
  }

  writeFileSync(path.join(outDir, "index.html"), html);

  // 2. Shared assets
  cpSync(path.join(rootDir, "shared", "styles.css"), path.join(outDir, "shared", "styles.css"));

  // 3. Library artifacts
  for (const lib of variant.libs) {
    const src = resolveLibSource(lib);
    if (!existsSync(src)) {
      console.error(`Missing ${src}. Build the library first (pnpm -F img2num build).`);
      process.exit(1);
    }
    const dest = path.join(outDir, lib.to);
    mkdirSync(path.dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
  }

  console.log(`Built ${name} -> ${path.relative(process.cwd(), outDir)}`);
}

for (const name of names) {
  buildVariant(name);
}

