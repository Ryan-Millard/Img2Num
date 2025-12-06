#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";

const changelogPath = "CHANGELOG.md";
const outputDir = "docs/changelog";

if (!fs.existsSync(changelogPath)) {
  console.log("[changelog] No CHANGELOG.md found. Skipping.");
  process.exit(0);
}

const content = fs.readFileSync(changelogPath, "utf8");
const lines = content.split(/\r?\n/);

let capture = false;
let releaseLines = [];
let version = null;

for (const line of lines) {
  const releaseMatch = line.match(/^###\s*([0-9]+\.[0-9]+\.[0-9]+)\s*\(([^)]+)\)/);
  if (releaseMatch) {
    if (capture) break; // stop at next release
    capture = true;
    version = releaseMatch[1];
  }
  if (capture) releaseLines.push(line);
}

if (!version) {
  console.log("[changelog] No release section detected. Skipping.");
  process.exit(0);
}

// Ensure output folder
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const outPath = path.join(outputDir, `${version}.md`);
fs.writeFileSync(outPath, releaseLines.join("\n"), "utf8");

console.log(`[changelog] Extracted release ${version} -> ${outPath}`);

// Amend the commit made by standard-version
try {
  // Stage the changelog folder
  execSync("git add docs/changelog", { stdio: "inherit" });

  // Amend the last commit without editing the message
  execSync("git commit --amend --no-edit", { stdio: "inherit" });

  console.log("[git] docs/changelog added and commit amended successfully.");
} catch (err) {
  console.error("[git] Error:", err.message);
  process.exit(1);
}

