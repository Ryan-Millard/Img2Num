import fs from "fs";

const [filePath, key = "version"] = process.argv.slice(2);

if (!filePath) {
  console.error("Usage: node read-version.js <file> [key]");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(filePath, "utf8"));
const value = config[key];

if (typeof value !== "string" || value.length === 0) {
  console.error(`Missing or invalid "${key}" in ${filePath}`);
  process.exit(1);
}

console.log(value);