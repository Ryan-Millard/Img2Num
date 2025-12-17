import fs from "fs";

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
        desc,
        command: scripts[name] || "No command defined",
        group,
      };
    }
  }

  return { flat, basicItems };
}
