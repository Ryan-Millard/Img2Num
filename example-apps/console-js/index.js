import { writeFileSync } from "fs";
import { imageToSv, terminateWasmModuleg } from "img2num";
import sharp from "sharp";

const imagePath = process.argv[2];

if (!imagePath) {
  console.error("Usage: node index.js <image-path>");
  process.exit(1);
}

console.log(`Processing image: ${imagePath}`);

const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer);
const { width, height } = info;

console.log(`Image size: ${width}x${height}`);
console.log("Running img2num in Node.js...");

try {
  const { svg } = await imageToSvg({ pixels, width, height });

  writeFileSync("output.svg", svg);
  console.log("Done! SVG saved to output.svg");
} catch (error) {
  console.error("Failed to convert image:");
  console.error(error);

  process.exitCode = 1;
} finally {
  await terminateWasmModule();
}

process.exit();
