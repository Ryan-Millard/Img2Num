#!/usr/bin/env node
const { execFileSync } = require("child_process");
const { join } = require("path");

// Config paths
const SCRIPT_DIR = __dirname; // docs/scripts/pydoc-markdown
const REPO_ROOT = join(SCRIPT_DIR, "..", "..", ".."); // repo root (uv project)
const GENERATE_PY_API_SCRIPT = join(SCRIPT_DIR, "generate_py_api.py");

module.exports = function genPyApi({ verbose } = {}) {
  const stdio = verbose ? "inherit" : ["ignore", "ignore", "inherit"]; // always surface errors
  try {
    execFileSync(
      "uv", ["run", "python", GENERATE_PY_API_SCRIPT], { stdio, cwd: REPO_ROOT }
    );
  } catch (err) {
    console.error("Python API doc generation failed:", err.message);
    process.exit(1);
  }
  console.log("Generated Python API docs -> docs/docs/py/api-reference/");
};

if (require.main === module) {
  const verbose = (process.argv[2] === "-v" || process.argv[2] === "--verbose") || false;
  module.exports({ verbose });
}
