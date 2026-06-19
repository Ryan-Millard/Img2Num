import fs from "fs";

export default function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
