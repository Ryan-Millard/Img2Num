import { writeFileSync } from "fs";
import { resolve } from "path";
import { imageToSvg, terminateWasmModule } from "img2num";
import sharp from "sharp";

const imagePath = process.argv[2];
const outputPath = process.argv[3] ?? "output.svg";

if (!imagePath) {
  console.error("Usage: node index.mjs <image-path> [output-path]");
  process.exit(1);
}

console.log(`Processing image: ${imagePath}`);

const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
const { width, height } = info;

console.log(`Image size: ${width}x${height}`);
console.log("Running img2num in Node.js...");

try {
  const { svg } = await imageToSvg({ pixels, width, height });

  const outputFilePath = resolve(outputPath);

  writeFileSync(outputFilePath, svg);
  console.log(`Done! SVG saved to ${outputFilePath}`);
} catch (error) {
  console.error("Failed to convert image:");
  console.error(error);

  process.exitCode = 1;
} finally {
  await terminateWasmModule();
}

process.exit();
