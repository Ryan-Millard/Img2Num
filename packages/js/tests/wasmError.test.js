import { test } from "node:test";
import assert from "node:assert/strict";

import { Img2NumError, readLastError, ERROR_CODE_NAMES } from "../src/wasmError.js";

const moduleWith = (code, message) => ({
  ccall: (name) => (name === "get_last_error" ? code : message),
});

test("readLastError returns null when the last call succeeded", () => {
  assert.equal(readLastError(moduleWith(0, "")), null);
});

test("readLastError maps INVALID_ARGUMENT to a readable Img2NumError", () => {
  const err = readLastError(moduleWith(2, "image_to_svg: image is too small"));
  assert.ok(err instanceof Img2NumError);
  assert.ok(err instanceof Error);
  assert.equal(err.name, "Img2NumError");
  assert.equal(err.code, 2);
  assert.equal(err.codeName, "INVALID_ARGUMENT");
  assert.equal(err.message, "image_to_svg: image is too small");
});

test("readLastError falls back to a generic message and UNKNOWN for odd codes", () => {
  const err = readLastError(moduleWith(99, ""));
  assert.equal(err.codeName, "UNKNOWN");
  assert.match(err.message, /99/);
});

test("ERROR_CODE_NAMES mirrors img2num_error_t", () => {
  assert.deepEqual([...ERROR_CODE_NAMES], ["OK", "BAD_ALLOC", "INVALID_ARGUMENT", "RUNTIME", "UNKNOWN"]);
});
