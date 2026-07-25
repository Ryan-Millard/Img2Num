import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const here = fileURLToPath(new URL(".", import.meta.url));
const TARGET = process.env.TARGET ?? "browser";

const TARGETS = {
  browser: {
    glue: "web",
    formats: ["es"],
    isNode: false,
    // ES6 glue is already ESM — no interop needed.
    needsCommonjs: false,
    // Copy the external .wasm next to the bundle.
    copyWasm: "required",
  },

  standalone: {
    glue: "standalone",
    formats: ["umd", "iife"],
    isNode: false,
    // Non-ES6 glue is CJS/UMD-shaped; Rollup needs help importing it.
    needsCommonjs: true,
    // Absent when SINGLE_FILE=1, present when it's 0.
    copyWasm: "optional",
  },

  "node-esm": {
    glue: "node", formats: ["es"], isNode: true, copyWasm: "required",
    outDir: "dist/node", emptyOutDir: true,
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
    glue: "node", formats: ["cjs"], isNode: true, copyWasm: "required",
    outDir: "dist/node", emptyOutDir: false,   // must not wipe the ESM output
    banner: undefined,
  },
};

const T = TARGETS[TARGET];
if (!T) {
  throw new Error(
    `Unknown TARGET "${TARGET}". Expected one of: ${Object.keys(TARGETS).join(", ")}`,
  );
}

/** Vite inlines `new URL('x.wasm', import.meta.url)` as a data URL in lib mode
 *  and ignores assetsInlineLimit. Hoisting the literal defeats the static
 *  analysis, leaving a real runtime URL resolution against the sibling file. */
function preventWasmInlining() {
  return {
    name: "img2num:prevent-wasm-inlining",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("build-wasm") || !T.copyWasm) return null;
      if (!code.includes("import.meta.url")) return null;

      const patched = code.replace(
        /new URL\((["'])(img2num\.wasm)\1,\s*import\.meta\.url\)/g,
        'new URL(globalThis.__IMG2NUM_WASM_NAME__ ??= "$2", import.meta.url)',
      );
      return patched === code ? null : { code: patched, map: null };
    },
  };
}

/** Copies the emitted .wasm into dist/<target>/ after the bundle is written. */
function copyWasmPlugin() {
  return {
    name: "img2num:copy-wasm",
    closeBundle() {
      if (!T.copyWasm) return;

      const src = path.join(here, "build-wasm", T.glue, "img2num.wasm");
      const destDir = path.join(here, T.outDir ?? `dist/${TARGET}`);

      if (!existsSync(src)) {
        if (T.copyWasm === "optional") return; // SINGLE_FILE=1 emits no .wasm
        throw new Error(
          `[img2num] Missing ${src}. Run the CMake wasm build first (pnpm build:wasm).`,
        );
      }

      mkdirSync(destDir, { recursive: true });
      copyFileSync(src, path.join(destDir, "img2num.wasm"));
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
  plugins: [
    preventWasmInlining(),
    // Scope the interop transform to the glue so it never touches src/.
    copyWasmPlugin(),
  ],

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
      external: T.isNode
        ? [/^node:/, "webgpu", "fs", "path", "url", "module", "crypto", "worker_threads"]
        : [],
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
