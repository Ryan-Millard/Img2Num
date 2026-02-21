#!/usr/bin/env node

const { execSync } = require("child_process");
const { rmSync, mkdirSync, writeFileSync, existsSync, readdirSync, renameSync, rmdirSync } = require("fs");
const { join } = require("path");

// Config paths
const SCRIPT_DIR = __dirname; // docs/scripts
const ROOT_DIR = join(SCRIPT_DIR, ".."); // docs/
const OUTPUT_PARENT_DIR = join(ROOT_DIR, "static/docs/internal");
const CORE_DIR = join("core");
const JS_BINDINGS_DIR = join("bindings", "js");
const C_BINDINGS_DIR = join("bindings", "c");

[CORE_DIR, JS_BINDINGS_DIR, C_BINDINGS_DIR].forEach((DIR) => {
  const OUTPUT_DIR = join(OUTPUT_PARENT_DIR, DIR, "api");
  const HTML_SUBDIR = join(OUTPUT_DIR, "html");

  // Step 1: Clear the API output directory
  if (existsSync(OUTPUT_DIR)) {
    console.log(`Removing ${OUTPUT_DIR}...`);
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }

  // Step 2: Recreate the API output directory with a .gitkeep
  console.log("Adding .gitkeep");
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, ".gitkeep"), "See the `doxygen.js` docs script about this.\n\nThis is for Doxygen's HTML output (C++ API docs).");

  // Step 3: Run Doxygen
  try {
    const DOXYFILE_PATH = join("..", DIR, "Doxyfile");
    if (!existsSync(DOXYFILE_PATH)) {
      throw new Error(`Doxyfile not found at: ${DOXYFILE_PATH}`);
    }
    console.log("Running Doxygen...");
    const DOXYFILE_DIR = join(ROOT_DIR, "..", DIR); // parent dir of the Doxyfile
    execSync(`doxygen Doxyfile`, { stdio: "inherit", cwd: DOXYFILE_DIR });
  } catch (err) {
    console.error("Doxygen failed:", err.message);
    process.exit(1);
  }

  // Step 4: Move HTML files out of html/ into api/ (parent folder)
  if (existsSync(HTML_SUBDIR)) {
    console.log("Moving HTML files to output directory...");
    const files = readdirSync(HTML_SUBDIR);
    files.forEach(file => {
      renameSync(join(HTML_SUBDIR, file), join(OUTPUT_DIR, file));
    });

    // Remove the now-empty html folder
    rmdirSync(HTML_SUBDIR);
  }

  console.log(
`================================================================================
                    DONE: ${DIR}
================================================================================`
  );
});

console.log("Doxygen build complete.");
