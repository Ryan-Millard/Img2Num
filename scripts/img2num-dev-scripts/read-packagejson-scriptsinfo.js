import fs from "fs";

/**
 * Load and normalize script metadata from a package-style JSON file.
 *
 * @param {string} fileUrl - Path to a JSON file that contains `scriptsInfo` and `scripts` top-level properties.
 * @returns {{flat: Record<string, {desc: string, args: any[], command: string, group: string}>, basicItems: any[]}} An object with:
 *  - `flat`: a mapping of script name to its CLI metadata (description defaults to `""`,
 *    args defaults to `[]`, command falls back to `"No command defined"`, and `group`
 *    is the originating group key).
 *  - `basicItems`: the array from `scriptsInfo._meta.basic` or an empty array when not present.
 */
export function readPackageJsonScripts(fileUrl) {
  const { scriptsInfo, scripts } = JSON.parse(fs.readFileSync(fileUrl));

  // Separate _meta
  const { _meta = {}, ...groups } = scriptsInfo;
  const basicItems = _meta.basic ?? [];

  // Flatten scripts for CLI
  const flat = {};
  for (const [group, entries] of Object.entries(groups)) {
    for (const [name, desc] of Object.entries(entries)) {
      flat[name] = {
        desc: desc.desc || "", // take the actual string description
        args: desc.args || [], // optional, if you want to show CLI args
        command: scripts[name] || "No command defined",
        group,
      };
    }
  }

  return { flat, basicItems };
}
