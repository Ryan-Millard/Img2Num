# Function: imageToUint8ClampedArray()

URL: https://img2num.dev/docs/js/api/functions/imageToUint8ClampedArray

> **imageToUint8ClampedArray** ( `file` ): `Promise` <{ `height` : `number` ; `pixels` : `Uint8ClampedArray` ; `width` : `number` ; }>

Defined in: imageToUint8ClampedArray.js:50

**`Function`**

## Parameters

### file

`File`

The image file to process. Must be a valid `File` object, e.g., from an `<input type="file">` element.

## Returns

`Promise` <{ `height` : `number` ; `pixels` : `Uint8ClampedArray` ; `width` : `number` ; }>

A Promise resolving to an object containing:

- `pixels` : A `Uint8ClampedArray` of RGBA pixel values.
- `width` : Width of the image in pixels.
- `height` : Height of the image in pixels.

## Async

## Description

Reads an image file (PNG, JPEG, etc.) and returns its pixel data as a `Uint8ClampedArray` . Each pixel consists of four consecutive values: red, green, blue, and alpha (RGBA). Also returns the image's original width and height. Useful for canvas operations, image processing, WebGL textures, or computer vision tasks.

## Throws

Will not throw in current implementation, but could reject if the image fails to load.

## Example

```ts
const fileInput = document.querySelector("#fileInput");
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  const { pixels, width, height } = await imageToUint8ClampedArray(file);
  console.log("Width:", width, "Height:", height);
  console.log("Pixels:", pixels);
});
```

## Todo

Add error handling for invalid or corrupt image files.

## Variation

Standard image file input
