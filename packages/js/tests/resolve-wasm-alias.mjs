const FAKE = new URL("./fixtures/fakeWasm.js", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@wasm/img2num.js") {
    return { url: FAKE, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
