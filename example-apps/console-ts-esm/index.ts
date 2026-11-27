import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { imageToSvg, terminateWasmModule } from "img2num";
import type { ImageToSvgOptions, SvgResult } from "img2num";
import sharp from "sharp";
import type { OutputInfo } from "sharp";

/** The command-line arguments: `<image-path> [output-path]`. */
interface CliArguments {
  readonly imagePath: string;
  readonly outputPath: string;
}

/** A decoded image in the layout `img2num` expects: flat 8-bit RGBA pixels and their dimensions. */
interface RgbaImage {
  readonly pixels: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}

const DEFAULT_OUTPUT_PATH: string = "output.svg";

/** Reads the arguments from `process.argv`, or returns `undefined` when the image path is missing. */
function parseArguments(argv: readonly string[]): CliArguments | undefined {
  const imagePath: string | undefined = argv[2];
  const outputPath: string = argv[3] ?? DEFAULT_OUTPUT_PATH;

  if (!imagePath) {
    return undefined;
  }

  return { imagePath, outputPath };
}

/** Decodes any image `sharp` can read into RGBA. */
async function decodeImage(imagePath: string): Promise<RgbaImage> {
  const { data, info }: { data: Buffer; info: OutputInfo } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const pixels: Uint8ClampedArray = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
  const { width, height }: OutputInfo = info;

  return { pixels, width, height };
}

async function main(): Promise<void> {
  const args: CliArguments | undefined = parseArguments(process.argv);

  if (args === undefined) {
    console.error("Usage: node index.ts <image-path> [output-path]");
    process.exitCode = 1;
    return;
  }

  console.log(`Processing image: ${args.imagePath}`);

  const { pixels, width, height }: RgbaImage = await decodeImage(args.imagePath);

  console.log(`Image size: ${width}x${height}`);
  console.log("Running img2num in Node.js...");

  try {
    const options: ImageToSvgOptions = { pixels, width, height };
    const { svg }: SvgResult = await imageToSvg(options);

    const outputFilePath: string = resolve(args.outputPath);

    writeFileSync(outputFilePath, svg);
    console.log(`Done! SVG saved to ${outputFilePath}`);
  } finally {
    await terminateWasmModule();
  }
}

main().catch((error: unknown): void => {
  console.error("Failed to convert image:");
  console.error(error);
  process.exitCode = 1;
});
