#!/usr/bin/env node
import { execSync } from "child_process";
import fg from "fast-glob";
import { cpus } from "os";
import { logColor, Colors } from "./colors.js";
import fs from "fs";

if (!fs.existsSync(".clang-format")) {
  logColor(
    "No .clang-format file found in repo root. Default style will be used.",
    Colors.YELLOW
  );
}

// --- CONFIG ---
const GLOBS = [
  "core/**/*.{hpp,cpp,h,c}",
  "bindings/**/*.{hpp,cpp,h,c}",
];
const MAX_PARALLEL = cpus().length;

// --- FIND FILES ---
const files = GLOBS.flatMap((pattern) => fg.sync(pattern, { dot: false }));

if (!files.length) {
  logColor("No C++ files found.", Colors.YELLOW);
  process.exit(0);
}

// --- PARSE ARGS ---
const checkOnly = process.argv.includes("--check");
const cmdBase = checkOnly
  ? "clang-format --dry-run --Werror"
  : "clang-format -i";

logColor(
  `${checkOnly ? "Checking" : "Formatting"} ${files.length} C++ file(s)...`,
  Colors.CYAN
);

// --- FORMAT FILES ---
let failed = false;

const runCommand = (file) => {
  try {
    execSync(`pnpm exec ${cmdBase} "${file}"`, { stdio: "inherit" });
    if (!checkOnly) logColor(`Formatted: ${file}`, Colors.GREEN);
  } catch (err) {
    logColor(
      `${checkOnly ? "Check failed" : "Formatting error"}: ${file}`,
      Colors.RED
    );
    failed = true;
  }
};

// --- PARALLEL EXECUTION ---
const chunkArray = (arr, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const chunks = chunkArray(files, MAX_PARALLEL);
chunks.forEach((chunk) => {
  chunk.forEach(runCommand);
});

// --- SUMMARY ---
if (failed) {
  logColor(
    `\nC++ ${checkOnly ? "format check" : "formatting"} complete with errors.`,
    Colors.RED
  );
  process.exit(1);
} else {
  logColor(
    `\nC++ ${checkOnly ? "format check" : "formatting"} complete successfully.`,
    Colors.GREEN
  );
}
