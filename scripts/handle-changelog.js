#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';

// Run standard-version
try {
  // Stage the changelog folder
  execSync('npx standard-version', { stdio: 'inherit' });

  console.log('[release] release created successfully');
} catch (err) {
  console.error('[release] Error:', err.message);
  process.exit(1);
}

const changelogPath = 'CHANGELOG.md';
const outputDir = 'docs/changelog';

if (!fs.existsSync(changelogPath)) {
  console.log('[changelog] No CHANGELOG.md found. Skipping.');
  process.exit(0);
}

const content = fs.readFileSync(changelogPath, 'utf8');

// Write to docs/changelog/complete-changelog.md
const completeChangelogPath = path.join(outputDir, 'complete-changelog.md');
let completeChangelogMdHeader = `---
title: Complete Changelog
---

`;
fs.writeFileSync(completeChangelogPath, completeChangelogMdHeader + content, 'utf8');

const lines = content.split(/\r?\n/);

let capture = false;
let releaseLines = [];
let version = null;
let date = null;

for (const line of lines) {
  const releaseMatch = line.match(/^###\s*\[?([0-9]+\.[0-9]+\.[0-9]+)\]?\s*\(?.*?\)?\s*\(([^)]+)\)/);
  if (releaseMatch) {
    if (capture) break; // stop at next release
    capture = true;
    version = releaseMatch[1];
    date = releaseMatch[2];
  }
  if (capture) releaseLines.push(line);
}

if (!version) {
  console.log('[changelog] No release section detected. Skipping.');
  process.exit(0);
}

// Ensure output folder
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const fileName = `${date}_${version}.md`;
const outPath = path.join(outputDir, fileName);
const frontmatter = `---
title: v${version}
id: ${fileName}
---

# Release ${version}

`;
const fileLines = frontmatter + releaseLines.join('\n');
fs.writeFileSync(outPath, fileLines, 'utf8');

console.log(`[changelog] Extracted release ${version} -> ${outPath}`);

// Stage the file so it also gets committed
try {
  // Stage the changelog folder
  execSync(`git add ${outPath} ${completeChangelogPath}`, { stdio: 'inherit' });
  execSync(`git commit -m "chore(changelog): add ${version} release notes"`, { stdio: 'inherit' });

  console.log('[git] docs/changelog added and commit amended successfully.');
} catch (err) {
  console.error('[git] Error:', err.message);
  process.exit(1);
}
