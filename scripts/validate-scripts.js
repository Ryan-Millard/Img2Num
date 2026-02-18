import { validateScripts } from 'img2num-dev-scripts';
import path from "path";

const dirsToValidate = [
  ".",
  "example-apps/react-js",
  "docs",
  "scripts/img2num-dev-scripts",
];

dirsToValidate.forEach((project) => {
  const pathToPackageJson = `./${project}/package.json`;
  const resolvedPath = path.resolve(pathToPackageJson);
  validateScripts(resolvedPath);
});
