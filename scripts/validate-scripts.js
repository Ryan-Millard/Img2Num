#!/usr/bin/env node
import fs from "fs";
import path from "path";

function loadPackageJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function flattenScriptsInfo(scriptsInfo) {
  const flat = {};
  for (const [group, entries] of Object.entries(scriptsInfo)) {
    if (group === "_meta") continue;
    for (const [name] of Object.entries(entries)) {
      flat[name] = true;
    }
  }
  return flat;
}

function validateScripts(pkgPath) {
  const pkg = loadPackageJson(pkgPath);
  const { scripts, scriptsInfo } = pkg;

  if (!scripts || !scriptsInfo) {
    console.error(`Missing scripts or scriptsInfo in ${pkgPath}`);
    process.exit(1);
  }

  const scriptsSet = new Set(Object.keys(scripts));
  const infoSet = new Set(Object.keys(flattenScriptsInfo(scriptsInfo)));

  let failed = false;

  // Scripts without description
  for (const script of scriptsSet) {
    if (!infoSet.has(script)) {
      console.error(`❌ Script "${script}" exists in scripts but missing in scriptsInfo`);
      failed = true;
    }
  }

  // Descriptions for scripts that don't exist
  for (const script of infoSet) {
    if (!scriptsSet.has(script)) {
      console.error(`❌ ScriptInfo entry "${script}" does not exist in scripts`);
      failed = true;
    }
  }

  if (failed) process.exit(1);

  console.log(`✅ All scripts validated for ${pkgPath}`);
}

// Validate main project
validateScripts(path.resolve("./package.json"));

// Validate docs project
validateScripts(path.resolve("./docs/package.json"));
