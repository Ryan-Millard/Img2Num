import mkdirp from "./mkdirp";
import path from "path";
import fs from "fs";

export default function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}
