import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { imageToSvg, terminateWasmModule } from "img2num";

const imagePath = process.argv[2];

if (!imagePath) {
  console.error("Usage: pnpm start <image-path>");
  process.exit(1);
}

console.log(`Processing image: ${imagePath}`);

const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const pixels = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
const { width, height } = info;

console.log(`Image size: ${width}x${height}`);

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
