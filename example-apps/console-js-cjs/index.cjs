const { writeFileSync } = require("fs");
const { resolve } = require("path");
const { imageToSvg, terminateWasmModule } = require("img2num");
const sharp = require("sharp");

async function main() {
  const imagePath = process.argv[2];
  const outputPath = process.argv[3] ?? "output.svg";

  if (!imagePath) {
    console.error("Usage: node index.cjs <image-path> [output-path]");
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
  } finally {
    await terminateWasmModule();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
