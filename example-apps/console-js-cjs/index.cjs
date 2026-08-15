const { writeFileSync } = require("fs");
const { imageToSvg, terminateWasmModule } = require("img2num");
const sharp = require("sharp");

async function main() {
  const imagePath = process.argv[2];

  if (!imagePath) {
    console.error("Usage: node index.cjs <image-path>");
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

    writeFileSync("output.svg", svg);
    console.log("Done! SVG saved to output.svg");
  } finally {
    await terminateWasmModule();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
