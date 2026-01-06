#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Load and parse a package.json (or other JSON) file from disk.
 *
 * If reading or parsing fails, logs an error including the file path and exits the process with code 1.
 * @param {string} filePath - Path to the JSON file to read.
 * @returns {Object} The parsed JSON object.
 */
function loadPackageJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to load ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Convert a grouped scriptsInfo object into a flat map of script names.
 *
 * @param {Object} scriptsInfo - An object whose keys are group names and values are objects of script entries; the group named "_meta" is ignored.
 * @returns {Object} A flat object mapping each script name to `true`.
 */
function flattenScriptsInfo(scriptsInfo) {
  const flat = {};
  for (const [group, entries] of Object.entries(scriptsInfo)) {
    if (group === '_meta') continue;
    for (const [name] of Object.entries(entries)) {
      flat[name] = true;
    }
  }
  return flat;
}

/**
 * Validates that the "scripts" keys in a package.json match the flattened entries in "scriptsInfo".
 *
 * If "scripts" or "scriptsInfo" is missing, or any script is undocumented or any
 * description refers to a non-existent script, logs errors and exits the process with
 * code 1. On success, logs a confirmation message.
 *
 * @param {string} pkgPath - Path to the package.json file to validate.
 */
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
validateScripts(path.resolve('./package.json'));

// Validate docs project
validateScripts(path.resolve('./docs/package.json'));
