import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const here = fileURLToPath(new URL(".", import.meta.url));
const TARGET = process.env.TARGET ?? "browser";

const TARGETS = {
  browser: {
    // ES6 glue is already ESM; imports cleanly, no interop involved.
    glue: "web",
    formats: ["es"],
    isNode: false,
    // Copy the external .wasm next to the bundle.
    copyWasm: "required",
  },

  standalone: {
    // Non-ES6 glue is CJS-shaped (module.exports), but
    // Rolldown-Vite's native CJS interop handles the
    // import, so no plugin is needed.
    // If this package ever moves back to Rollup-based Vite (<=5), add
    // build.commonjsOptions.include = [/node_modules/, /build-wasm/].
    glue: "standalone",
    formats: ["umd", "iife"],
    isNode: false,
    // Absent when SINGLE_FILE=1, present when SINGLE_FILE=0
    copyWasm: "optional",
  },

  "node-esm": {
    glue: "node",
    formats: ["es"],
    isNode: true,
    copyWasm: "required",
    outDir: "dist/node",
    emptyOutDir: true,
    // Emscripten's CJS-shaped node glue reads __dirname/__filename. ESM has
    // neither, and platform:'node' only shims require().
    banner: [
      'import { fileURLToPath as __i2nFileURLToPath } from "node:url";',
      'import { dirname as __i2nDirname } from "node:path";',
      "const __filename = __i2nFileURLToPath(import.meta.url);",
      "const __dirname = __i2nDirname(__filename);",
    ].join("\n"),
  },
  "node-cjs": {
    glue: "node",
    formats: ["cjs"],
    isNode: true,
    copyWasm: "required",
    outDir: "dist/node",
    emptyOutDir: false, // must not wipe the ESM output
    banner: undefined,
  },
};

const T = TARGETS[TARGET];
if (!T) {
  throw new Error(`Unknown TARGET "${TARGET}". Expected one of: ${Object.keys(TARGETS).join(", ")}`);
}

/**
 * Copies the emitted .wasm into dist/<target>/ after the bundle is written.
 */
function copyWasmPlugin() {
  return {
    name: "img2num:copy-wasm",
    closeBundle() {
      if (!T.copyWasm) return;

      const src = path.join(here, "build-wasm", T.glue, "img2num.wasm");
      const destDir = path.join(here, T.outDir ?? `dist/${TARGET}`);

      if (!existsSync(src)) {
        if (T.copyWasm === "optional") return; // SINGLE_FILE=1 emits no .wasm
        throw new Error(`[img2num] Missing ${src}. Run the CMake wasm build first (pnpm build:wasm).`);
      }

      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, path.join(destDir, "img2num.wasm"));
    },
  };
}

function cjsWebgpuGuard() {
  // Only the CJS node build can regress into a require of webgpu; the other
  // targets either keep real import() (node-esm) or exclude webgpu entirely.
  if (TARGET !== "node-cjs") return { name: "img2num:cjs-webgpu-guard" };
  return {
    name: "img2num:cjs-webgpu-guard",
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        // Matched against raw chunk code, no comment stripping: stripping
        // comments with a regex mis-lexes // inside string literals (URLs)
        // and can hide a real call. Instead, the source is kept free of the
        // literal in comments (see src/target/node/webgpu.js JSDoc), so any
        // match here is executable code. A future comment reintroducing the
        // literal fails the build loudly, which is the safe direction.
        if (/require\(\s*["']webgpu["']\s*\)/.test(chunk.code)) {
          throw new Error(`[img2num] ${chunk.fileName} contains a require of "webgpu" -- throws ERR_REQUIRE_ESM on Node < 22.12. The dynamic import() was lowered; see src/target/node/webgpu.js.`);
        }
      }
    },
  };
}

/**
 * Ships a bundler-detectable wasm URL in the published output.
 *
 * Problem: Vite's lib mode inlines `new URL("x.wasm", import.meta.url)` as a
 * data URL and ignores assetsInlineLimit. But downstream bundlers (Vite,
 * webpack 5, Rollup, Parcel) rely on that exact literal form to detect,
 * emit, and rewrite the wasm asset in *consumer* builds.
 *
 * Solution, in two phases:
 *   1. transform: mangle the literal into a non-static expression so
 *      lib-mode asset analysis can't inline it.
 *   2. generateBundle: after analysis is done, restore a bundler-detectable
 *      form in the emitted chunk. The restored form is a TERNARY, not the
 *      bare literal: the false branch is the exact literal (which consumer
 *      bundlers detect and rewrite), while the true branch preserves
 *      `globalThis.__IMG2NUM_WASM_NAME__` as a runtime override for exotic
 *      setups (e.g. CDN-hosted wasm). Do not "simplify" the ternary away --
 *      collapsing it to the literal silently kills the override.
 *
 * LOAD-BEARING CONSTRAINT: the mangled sentinel must be valid syntax at
 * build.target (es2020). Do NOT use `??=` or other ES2021+ operators here --
 * they get transpiled before generateBundle runs, the restore match fails
 * silently, and the published chunk ships a non-static URL (the 0.4.0 bug).
 * `||` is safe at es2020.
 */
function wasmUrlPlugin() {
  const LITERAL = 'new URL("img2num.wasm", import.meta.url)';
  const MANGLED = 'new URL(globalThis.__IMG2NUM_WASM_NAME__ || "img2num.wasm", import.meta.url)';
  const WASM_NAME = "globalThis.__IMG2NUM_WASM_NAME__";
  // Override wins when set; otherwise the literal branch is what consumer
  // bundlers statically detect. Bundlers match the expression node, so the
  // literal being inside a ternary branch does not defeat detection.
  const RESTORED = `(${WASM_NAME} ? new URL(${WASM_NAME}, import.meta.url) : ${LITERAL})`;

  // The pattern only exists in the ES6 web glue; node glue resolves via
  // __dirname and standalone glue via document.currentScript. Restricting to
  // the browser target makes that a structural guarantee instead of a
  // coincidence of glue contents.
  if (TARGET !== "browser") return { name: "img2num:wasm-url" };

  return {
    name: "img2num:wasm-url",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("build-wasm")) return null;
      if (!code.includes("import.meta.url")) return null;

      const patched = code.replace(/new URL\((["'])(img2num\.wasm)\1,\s*import\.meta\.url\)/g, MANGLED);
      return patched === code ? null : { code: patched, map: null };
    },
    generateBundle(_, bundle) {
      // Tolerant match: quote style and whitespace may be normalized by the
      // bundler even when the expression itself survives.
      const mangledRe = /new URL\(\s*globalThis\.__IMG2NUM_WASM_NAME__\s*\|\|\s*(["'])img2num\.wasm\1\s*,\s*import\.meta\.url\s*\)/g;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        chunk.code = chunk.code.replace(mangledRe, RESTORED);
      }

      // Guard: the browser ES build must ship the bundler-detectable literal.
      // Fails the build loudly instead of shipping a consumer-breaking chunk.
      const hasLiteral = Object.values(bundle).some((c) => c.type === "chunk" && c.code.includes(LITERAL));
      if (!hasLiteral) {
        throw new Error("[img2num] wasm URL literal missing from browser bundle -- consumers' bundlers won't detect the asset.");
      }
    },
  };
}

const FILE_NAMES = {
  es: "img2num.js",
  cjs: "img2num.cjs",
  umd: "img2num.umd.js",
  iife: "img2num.iife.js",
};

export default defineConfig({
  plugins: [wasmUrlPlugin(), copyWasmPlugin(), cjsWebgpuGuard()],

  build: {
    outDir: T.outDir ?? `dist/${TARGET}`,
    emptyOutDir: T.emptyOutDir ?? true,
    sourcemap: true,
    // Consumers of es/cjs minify themselves; the <script>-tag build can't.
    minify: TARGET === "standalone",
    target: T.isNode ? "node18" : "es2020",

    lib: {
      entry: path.resolve(here, "src/index.js"),
      name: "Img2Num",
      formats: T.formats,
      fileName: (format) => FILE_NAMES[format],
    },

    rollupOptions: {
      platform: T.isNode ? "node" : "browser",
      external: T.isNode ? [/^node:/, "webgpu", "fs", "path", "url", "module", "crypto", "worker_threads"] : [],
      output: { exports: "named", ...(T.banner ? { banner: T.banner } : {}) },
    },
  },

  define: {
    // "standalone" is a browser build; the node branches must compile out.
    __TARGET__: JSON.stringify(T.isNode ? "node" : "browser"),
  },

  resolve: {
    alias: {
      "@wasm": path.resolve(here, `./build-wasm/${T.glue}`),
    },
  },
});
