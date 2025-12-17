import fs from "fs";

export function readPackageJsonScripts(relativeLocation) {
  const { scriptsInfo, scripts } = JSON.parse(
    fs.readFileSync(new URL(relativeLocation, import.meta.url))
  );

  const flat = {};
  for (const [group, entries] of Object.entries(scriptsInfo)) {
    for (const [name, desc] of Object.entries(entries)) {
      flat[name] = {
        desc,
        command: scripts[name] || "No command defined",
        group,
      };
    }
  }
  return flat;
}
