#!/usr/bin/env node
import fs from "fs";
import { logColor, Colors } from "./colors.js";

/**
 * Load and parse a package.json (or other JSON) file from disk.
 */
function loadPackageJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    logColor(`Failed to load ${filePath}: ${error.message}`, Colors.RED);
    process.exit(1);
  }
}

/**
 * Flatten a scriptsInfo object into a flat map.
 */
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

/**
 * Validate that package.json scripts match scriptsInfo.
 */
export function validateScripts(pkgPath) {
  const pkg = loadPackageJson(pkgPath);
  const { scripts, scriptsInfo } = pkg;

  if (!scripts || !scriptsInfo) {
    logColor(`Missing scripts or scriptsInfo in ${pkgPath}`, Colors.RED);
    process.exit(1);
  }

  const scriptsSet = new Set(Object.keys(scripts));
  const infoSet = new Set(Object.keys(flattenScriptsInfo(scriptsInfo)));
  let failed = false;

  // Scripts without description and not ignored
  for (const script of scriptsSet) {
    if (!infoSet.has(script) && !scriptsInfo._meta.ignore.includes(script)) {
      logColor(`Script "${script}" exists in scripts but missing in scriptsInfo`, Colors.RED);
      failed = true;
    }
  }

  // Scripts that are in ignore shouldn’t exist in scriptsInfo
  for (const ignored of scriptsInfo._meta?.ignore ?? []) {
    for (const group of Object.keys(scriptsInfo)) {
      if (group === "_meta") continue;
      if (ignored in scriptsInfo[group]) {
        logColor(
          `Ignored script "${ignored}" should not appear in scriptsInfo group "${group}"`,
          Colors.RED
        );
        failed = true;
      }
    }
  }

  // Descriptions for scripts that don't exist
  for (const script of infoSet) {
    if (!scriptsSet.has(script)) {
      logColor(`ScriptInfo entry "${script}" does not exist in scripts`, Colors.RED);
      failed = true;
    }
  }

  if (failed) process.exit(1);

  logColor(`All scripts validated for ${pkgPath}`, Colors.GREEN);
}
