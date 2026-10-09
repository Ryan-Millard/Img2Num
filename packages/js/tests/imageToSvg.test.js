// Exercises the real imageToSvg -> callWasm -> readLastError path against a fake
// WASM module (see tests/register.mjs). Verifies that core rejections surface as
// rejected Promises with a readable Error, and that WASM memory is released.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { fakeCore } from "./fixtures/fakeWasm.js";
import { imageToSvg, Img2NumError } from "../src/index.js";

const rgba = (w, h) => new Uint8ClampedArray(w * h * 4);

beforeEach(() => fakeCore.reset());

test("valid call resolves with the SVG and frees all WASM memory", async () => {
  const { svg } = await imageToSvg({ pixels: rgba(32, 32), width: 32, height: 32 });
  assert.equal(svg, "<svg/>");
  assert.equal(fakeCore.live.size, 0);
});

test("core INVALID_ARGUMENT rejects with a readable Img2NumError (small image)", async () => {
  fakeCore.failWith = { code: 2, message: "image_to_svg: image is too small: the shortest side must be at least 16 pixels (got 8 x 8)" };

  await assert.rejects(imageToSvg({ pixels: rgba(8, 8), width: 8, height: 8 }), (err) => {
    assert.ok(err instanceof Img2NumError);
    assert.equal(err.codeName, "INVALID_ARGUMENT");
    assert.match(err.message, /too small/);
    assert.match(err.message, /16 pixels/);
    return true;
  });
  // Input buffer must be released even though the call failed.
  assert.equal(fakeCore.live.size, 0);
});

test("core rejection is not returned as { svg: null }", async () => {
  fakeCore.failWith = { code: 2, message: "image_to_svg: kmeans.k must be >= 1 (got 0)" };
  await assert.rejects(imageToSvg({ pixels: rgba(32, 32), width: 32, height: 32, num_colors: 0 }), /kmeans\.k/);
});

test("a failed call does not poison the next successful call", async () => {
  fakeCore.failWith = { code: 2, message: "boom" };
  await assert.rejects(imageToSvg({ pixels: rgba(32, 32), width: 32, height: 32 }), /boom/);

  fakeCore.failWith = null;
  const { svg } = await imageToSvg({ pixels: rgba(32, 32), width: 32, height: 32 });
  assert.equal(svg, "<svg/>");
});

test("pixel buffer shorter than width * height * 4 is rejected before reaching WASM", async () => {
  await assert.rejects(
    imageToSvg({ pixels: new Uint8ClampedArray(32 * 32 * 3), width: 32, height: 32 }), // RGB, not RGBA
    (err) => {
      assert.ok(err instanceof Img2NumError);
      assert.equal(err.codeName, "INVALID_ARGUMENT");
      assert.match(err.message, /width \* height \* 4/);
      return true;
    },
  );
  assert.equal(fakeCore.live.size, 0);
});

test("empty pixels with zero dimensions is left to the core to reject", async () => {
  fakeCore.failWith = { code: 2, message: "image_to_svg: width and height must be positive (got 0 x 0)" };
  await assert.rejects(imageToSvg({ pixels: new Uint8ClampedArray(0), width: 0, height: 0 }), /positive/);
});
