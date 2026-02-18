/**
 * @packageDocumentation
 * Convenience image conversion utility to ensure type compatibility with the library.
 *
 * @file Convenience utility function.
 *
 * @module image-utils
 * @license MIT
 * @copyright Ryan Millard 2026
 * @author Ryan Millard
 * @since 0.0.0
 *
 * @exports imageToUint8ClampedArray
 */

/**
 * @summary Convert an image file into a `Uint8ClampedArray` of pixel data (RGBA).
 *
 * @function imageToUint8ClampedArray
 * @async
 * @description
 * Reads an image file (PNG, JPEG, etc.) and returns its pixel data as a `Uint8ClampedArray`.
 * Each pixel consists of four consecutive values: red, green, blue, and alpha (RGBA).
 * Also returns the image's original width and height. Useful for canvas operations,
 * image processing, WebGL textures, or computer vision tasks.
 *
 *
 * @param {File} file - The image file to process. Must be a valid `File` object, e.g., from an `<input type="file">` element.
 *
 * @returns {Promise<{pixels: Uint8ClampedArray, width: number, height: number}>}
 * A Promise resolving to an object containing:
 * - `pixels`: A `Uint8ClampedArray` of RGBA pixel values.
 * - `width`: Width of the image in pixels.
 * - `height`: Height of the image in pixels.
 *
 * @throws {Error} Will not throw in current implementation, but could reject if the image fails to load.
 *
 * @example
 * const fileInput = document.querySelector("#fileInput");
 * fileInput.addEventListener("change", async (event) => {
 *   const file = event.target.files[0];
 *   const { pixels, width, height } = await imageToUint8ClampedArray(file);
 *   console.log("Width:", width, "Height:", height);
 *   console.log("Pixels:", pixels);
 * });
 *
 * @todo Add error handling for invalid or corrupt image files.
 * @variation Standard image file input
 */
export function imageToUint8ClampedArray(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height); // RGBA

      resolve({ pixels: data, width: img.width, height: img.height });
    };
    img.src = URL.createObjectURL(file);
  });
}
