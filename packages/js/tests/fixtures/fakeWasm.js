// In-memory stand-in for the Emscripten module (`createImg2NumModule`).
// It reproduces the *contract* of the real build, not the image processing:
//   - failures never trap; they set a "last error" and return 0/NULL
//   - get_last_error / get_last_error_message expose that state
//   - each call starts by clearing the previous error (like clear_last_error_and_catch)

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Test control surface. */
export const fakeCore = {
  /** When set, the next image_to_svg call fails with this {code, message}. */
  failWith: null,
  /** Pointers handed out by _malloc that have not been freed yet. */
  live: new Set(),
  reset() {
    this.failWith = null;
    this.live.clear();
  },
};

export default async function createImg2NumModule() {
  const heap = new ArrayBuffer(1 << 20);
  const HEAPU8 = new Uint8Array(heap);
  const HEAP32 = new Int32Array(heap);
  let next = 1024; // never hand out 0 (NULL)
  let lastError = { code: 0, message: "" };

  const mod = {
    HEAPU8,
    HEAP32,
    _malloc(n) {
      const ptr = next;
      next += (n + 7) & ~7;
      fakeCore.live.add(ptr);
      return ptr;
    },
    _free(ptr) {
      fakeCore.live.delete(ptr);
    },
    lengthBytesUTF8: (s) => enc.encode(s).length,
    stringToUTF8(s, ptr) {
      const bytes = enc.encode(s);
      HEAPU8.set(bytes, ptr);
      HEAPU8[ptr + bytes.length] = 0;
    },
    UTF8ToString(ptr) {
      let end = ptr;
      while (HEAPU8[end] !== 0) end++;
      return dec.decode(HEAPU8.subarray(ptr, end));
    },
    ccall(name, returnType, _argTypes, _args, opts) {
      let value;
      switch (name) {
        case "get_last_error":
          value = lastError.code;
          break;
        case "get_last_error_message":
          value = returnType === "string" ? lastError.message : 0;
          break;
        case "image_to_svg": {
          lastError = { code: 0, message: "" };
          if (fakeCore.failWith) {
            lastError = fakeCore.failWith;
            value = 0; // NULL, as the C API returns on failure
          } else {
            const svg = "<svg/>";
            value = mod._malloc(svg.length + 1);
            mod.stringToUTF8(svg, value);
          }
          break;
        }
        default:
          throw new Error(`fakeWasm: unexpected ccall(${name})`);
      }
      return opts?.async ? Promise.resolve(value) : value;
    },
  };
  return mod;
}
