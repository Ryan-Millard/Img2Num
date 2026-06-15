#!/usr/bin/env node

const { execSync } = require("child_process");
const { rmSync, mkdirSync, writeFileSync, existsSync, readdirSync, renameSync, rmdirSync } = require("fs");
const { join } = require("path");

// Config paths
const SCRIPT_DIR = __dirname; // docs/scripts
const ROOT_DIR = join(SCRIPT_DIR, ".."); // docs/
const OUTPUT_PARENT_DIR = join(ROOT_DIR, "static/docs");
const CORE_DIR = join("core");
const JS_BINDINGS_DIR = join("bindings", "js");
const C_BINDINGS_DIR = join("bindings", "c");

const DOXYFILES = [
  {
    fileName: "Doxyfile.public",
    srcDir: CORE_DIR,
    outDir: join(OUTPUT_PARENT_DIR, "cpp", "api")
  },
  {
    fileName: "Doxyfile.internal",
    srcDir: CORE_DIR,
    outDir: join(OUTPUT_PARENT_DIR, "internal", "core", "api")
  },
  {
    fileName: "Doxyfile.internal",
    srcDir: JS_BINDINGS_DIR,
    outDir: join(OUTPUT_PARENT_DIR, "internal", "bindings", "js", "api")
  },
  {
    fileName: "Doxyfile.public",
    srcDir: C_BINDINGS_DIR,
    outDir: join(OUTPUT_PARENT_DIR, "c", "api")
  }
];

module.exports = function doxygen({ verbose }) {
  const stdio = verbose ? "inherit" : "ignore";

  DOXYFILES.forEach(({ fileName, srcDir, outDir }) => {
    // Step 1: Clear the API output directory
    if (existsSync(outDir)) {
      rmSync(outDir, { recursive: true, force: true });
    }

    // Step 2: Recreate the API output directory with a .gitkeep
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, ".gitkeep"), "See the `doxygen.js` docs script about this.\n\nThis is for Doxygen's HTML output (C++ API docs).");

    // Step 3: Run Doxygen
    try {
      const DOXYFILE_PATH = join(ROOT_DIR, "..", srcDir, fileName);
      if (!existsSync(DOXYFILE_PATH)) {
        throw new Error(`Doxyfile not found at: ${DOXYFILE_PATH}`);
      }
      const DOXYFILE_DIR = join(ROOT_DIR, "..", srcDir); // parent dir of the Doxyfile
      const cmd = `doxygen ${fileName}`;
      execSync(cmd, { stdio, cwd: DOXYFILE_DIR });
    } catch (err) {
      console.error(`Doxygen generation failed for ${srcDir}/${fileName}: `, err.message);
      process.exit(1);
    }

    // Step 4: Move HTML files out of html/ into api/ (parent folder)
    const HTML_SUBDIR = join(outDir, "html");
    if (existsSync(HTML_SUBDIR)) {
      const files = readdirSync(HTML_SUBDIR);
      files.forEach(file => {
        renameSync(join(HTML_SUBDIR, file), join(outDir, file));
      });

      // Remove the now-empty html folder
      rmdirSync(HTML_SUBDIR);
    }
  });

  console.log("Generated Doxygen docs:");
  console.table(DOXYFILES);
  console.log("Doxygen build complete.");
}

if (require.main === module) {
  const verbose = (process.argv[2] === "-v" || process.argv[2] === "--verbose") || false;
  module.exports({ verbose });
}
