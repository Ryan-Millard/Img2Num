import fs from "fs";

export default function renderTemplate(templatePath, replacements) {
  let content = fs.readFileSync(templatePath, "utf8");

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`{{${key}}}`, String(value));
  }

  return content;
}
