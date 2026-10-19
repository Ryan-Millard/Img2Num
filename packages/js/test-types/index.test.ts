import { gaussianBlur, bilateralFilter, blackThreshold, kmeans, findContours, imageToSvg, imageToUint8ClampedArray, terminateWasmModule } from "img2num";

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type Pixels = Uint8ClampedArray;
type Opts<F extends (...args: any[]) => any> = Parameters<F>[0];

// Return shapes
export type Returns = [
  Expect<Equal<ReturnType<typeof gaussianBlur>, Promise<Pixels>>>,
  Expect<Equal<ReturnType<typeof bilateralFilter>, Promise<Pixels>>>,
  Expect<Equal<ReturnType<typeof blackThreshold>, Promise<Pixels>>>,
  Expect<Equal<ReturnType<typeof kmeans>, Promise<{ pixels: Pixels; labels: Int32Array }>>>,
  Expect<Equal<ReturnType<typeof findContours>, Promise<{ svg: string }>>>,
  Expect<Equal<ReturnType<typeof imageToSvg>, Promise<{ svg: string }>>>,
  Expect<Equal<ReturnType<typeof imageToUint8ClampedArray>, Promise<{ pixels: Pixels; width: number; height: number }>>>,
  Expect<Equal<ReturnType<typeof terminateWasmModule>, Promise<void>>>,
];

// color_space is 0 | 1
export type ColorSpaces = [
  Expect<Equal<Opts<typeof bilateralFilter>["color_space"], 0 | 1 | undefined>>,
  Expect<Equal<Opts<typeof kmeans>["color_space"], 0 | 1 | undefined>>,
  Expect<Equal<Opts<typeof imageToSvg>["color_space"], 0 | 1 | undefined>>,
];

// Valid calls
declare const pixels: Pixels;
declare const labels: Int32Array;
gaussianBlur({ pixels, width: 1, height: 1 });
bilateralFilter({ pixels, width: 1, height: 1, color_space: 1 });
blackThreshold({ pixels, width: 1, height: 1, num_colors: 8 });
kmeans({ pixels, width: 1, height: 1, num_colors: 8, max_iter: 10 });
findContours({ pixels, labels, width: 1, height: 1 });
imageToSvg({ pixels, width: 1, height: 1, num_colors: 16 });

// Invalid calls must fail
// @ts-expect-error color_space only accepts 0 | 1
bilateralFilter({ pixels, width: 1, height: 1, color_space: 2 });
// @ts-expect-error num_colors is required
blackThreshold({ pixels, width: 1, height: 1 });
// @ts-expect-error labels is required
findContours({ pixels, width: 1, height: 1 });
