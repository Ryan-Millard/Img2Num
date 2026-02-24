---
id: use-wasm-worker
title: useWasmWorker
hide_title: false
description: A custom React hook for calling Image WASM functions via a web worker, with generic calls and convenience wrappers.
---

# useWasmWorker Hook

This hook provides a **React-friendly interface** to [`wasmWorker.js`](../../workers/wasm-worker) for calling functions exported by the Image WASM module.

It keeps **all heavy computation off the main thread** by delegating work to a Web Worker, while abstracting away memory management and WASM interop.

:::important What this hook abstracts

- Worker lifecycle and messaging
- WASM module initialization
- Memory allocation (`_malloc`) and cleanup (`_free`)
- TypedArray ↔ WASM heap copying
- WASM function invocation
- Return value and output buffer handling

:::

## Two Layers of the API

`useWasmWorker` exposes **two levels of interaction**:

1. **A generic `call` method** – low-level, flexible, mirrors raw WASM exports
2. **Convenience wrapper functions** – high-level, ergonomic, domain-specific helpers

Most application code should use the **convenience wrappers**. The generic `call` method exists for extensibility and advanced use cases.

## Generic `call` Method

### Signature

```ts
call({
  funcName: string,
  args?: Record<string, any>,
  bufferKeys?: { key: string; type: keyof WASM_TYPES }[],
  returnType?: 'void' | 'string' | 'Int32Array' | 'Uint8Array' | 'Uint8ClampedArray'
}) => Promise<{ output: Record<string, TypedArray>; returnValue: any }>
```

:::tip
Also see the [`WASM_TYPES` documentation](../../workers/wasm-worker/#typedarray-and-value-handling-wasm_types) to understand the supported `bufferKeys` types.

`void` is a supported `returnType` but not `bufferKeys` type.
:::

### Example

```js
const { call } = useWasmWorker();

const { output } = await call({
  funcName: "add_arrays",
  args: {
    a: arrayA,
    b: arrayB,
    out: outputArray,
    length: arrayA.length,
  },
  bufferKeys: [
    { key: "a", type: "Int32Array" },
    { key: "b", type: "Int32Array" },
    { key: "out", type: "Int32Array" },
  ],
});

console.log(output.out);
```

### Key Rules (Very Important)

:::danger Argument order is strict
The **order of arguments passed to WASM must exactly match the C++ function signature**.

Although `args` is an object, the worker calls the WASM function using:

```js
wasmModule[`_${funcName}`](...Object.values(args));
```

That means:

```cpp
int add(int a, int b);
```

**Must be called as:**

```js
args = { a, b }; // correct
```

```js
args = { b, a }; // ❌ wrong
```

:::

## Convenience Wrapper Functions

The hook exposes several **predefined helpers** that wrap `call()` with the correct argument order, buffer configuration, and defaults.

These functions:

- Hide `bufferKeys` and `returnType`
- Enforce correct argument ordering
- Return clean JS values instead of raw WASM outputs

### `gaussianBlur`

Calls the Gaussian blur from the [Image WASM module](../../../wasm/modules/image/).

#### Signature

```ts
gaussianBlur(params: {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  /**
   * @default width * 0.005
   */
  sigma_pixels?: number;
}): Promise<Uint8ClampedArray>
```

#### Example Usage

```ts
const { gaussianBlur } = useWasmWorker();

const blurredPixels = await gaussianBlur({
  pixels,
  width,
  height,
  sigma_pixels: width * percentageOfWidth,
});
```

### `bilateralFilter`

Calls the [`bilateral filter`](../../../wasm/modules/image/bilateral_filter/) from the [Image WASM module](../../../wasm/modules/image/).

#### Signature

```ts
bilateralFilter(params: {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  /**
   * @default 3
   */
  sigma_spatial?: number;
  /**
   * @default 50
   */
  sigma_range?: number;
  /**
   * @default 0
   */
  color_space?: number;
  /**
   * @default 8
   */
  n_threads?: number;
}): Promise<Uint8ClampedArray>
```

:::note `color_space` parameter

Possible values:

- **0**: CIE La\*b\* (closer to human perception)
- **1**: sRGB (the default color space for computers)

The default for this parameter is CIE LAB because it is closer to human perception, and bilateral filters typically produce better edge-preserving results in perceptually uniform color spaces.

:::

#### Example Usage

```ts
const { bilateralFilter } = useWasmWorker();

const filteredPixels = await bilateralFilter({
  pixels,
  width,
  height,
  sigma_spatial: 2,
  sigma_range: 30,
  color_space: 1,
});
```

### `blackThreshold`

Calls the black threshold function from the [Image WASM module](../../../wasm/modules/image/).

#### Signature

```ts
blackThreshold(params: {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  num_colors: number;
}): Promise<Uint8ClampedArray>
```

#### Example Usage

```ts
const { blackThreshold } = useWasmWorker();

const thresholdedPixels = await blackThreshold({
  pixels,
  width,
  height,
  num_colors: 8,
});
```

### `kmeans`

Calls the K-Means clustering function from the [Image WASM module](../../../wasm/modules/image/).

#### Signature

```ts
kmeans(params: {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  num_colors: number;
  /**
   * @default 100
   */
  max_iter?: number;
}): Promise<{ pixels: Uint8ClampedArray; labels: Int32Array }>
```

#### Example Usage

```ts
const { kmeans } = useWasmWorker();

const { pixels: clusteredPixels, labels } = await kmeans({
  pixels,
  width,
  height,
  num_colors: 8,
});
```

### `findContours`

Finds contours after K-Means clustering from the [Image WASM module](../../../wasm/modules/image/).

#### Signature

```ts
findContours(params: {
  pixels: Uint8ClampedArray;
  labels: Int32Array;
  width: number;
  height: number;
  /**
   * `@default` 100
   */
  min_area?: number;
  /**
   * `@default` false
   */
  draw_contour_borders?: boolean;
}): Promise<{ svg: string; visualization: Uint8ClampedArray }>
```

#### Example Usage

```ts
const { findContours } = useWasmWorker();

const {
  svg, // pixels converted to SVG string
  visualization, // pixels raster image with contours outlined
} = await findContours({
  pixels,
  labels,
  width,
  height,
  min_area: 100,
  draw_contour_borders: false,
});
```

## TypedArray Handling

All TypedArrays passed to WASM must be declared in `bufferKeys`.

Each entry specifies:

```ts
{
  key: string;
  type: "Int32Array" | "Uint8Array" | "Uint8ClampedArray";
}
```

The worker will:

1. Allocate memory with `_malloc`
2. Copy the JS array into the correct HEAP view
3. Pass the pointer to WASM
4. Read the buffer back after execution
5. Free the memory

## Supported Types

The worker currently supports:

- `Int32Array` → `HEAP32`
- `Uint8Array` → `HEAPU8`
- `Uint8ClampedArray` → `HEAPU8`
- `string` (UTF-8)
- `void` (only for returned values)

## Adding New WASM Functions

1. **Export the function from C++** using the Img2Num `EXPORTED` macro (preferred):

   ```cpp
   #include "exported.h"

   EXPORTED void my_function(int* data, int length);
   ```

2. **Ensure argument order is final** – JS must match it exactly.

3. **Add a convenience wrapper** in `useWasmWorker`:

   ```js
   myFunction: async ({ data, length }) => {
     const result = await call({
       funcName: "my_function",
       args: { data, length },
       bufferKeys: [{ key: "data", type: "Int32Array" }],
     });
     return result.output.data;
   };
   ```

## Adding New TypedArray Types

If you add a new TypedArray type (e.g. `Float32Array`):

1. Export the corresponding HEAP view via `EXPORTED_RUNTIME_METHODS` in the module's `CMakeLists.txt`.
2. Add an entry to `WASM_TYPES` in `wasmWorker.js`
3. Implement `alloc` and `read`

Failing to do this will cause memory corruption or crashes.

## Diagram: React → Worker → WASM Flow

```mermaid
flowchart TD
<<<<<<< HEAD
  A[React calls hook] --> B[useWasmWorker posts message]
  B --> C[Worker waits for WASM ready]
  C --> D[Allocate WASM memory]
  D --> E[Call WASM export]
  E --> F[Read back buffers / return value]
  F --> G[Free memory]
  G --> H[Post result back]
  H --> I[Promise resolves in React]
```

## Summary

- `useWasmWorker` provides **safe, async WASM access from React**
- Argument order **must exactly match C++ signatures**
- TypedArrays require explicit declaration via `bufferKeys`
- Convenience wrappers are the preferred API
- Memory allocation and cleanup are fully automatic
=======
    A["React component calls hook function"] --> B["useWasmWorker posts message to wasmWorker"]
    B --> C["Worker allocates WASM memory for TypedArrays"]
    C --> D["Worker calls WASM function dynamically"]
    D --> E["Worker reads back modified buffers"]
    E --> F["Worker frees allocated memory"]
    F --> G["Worker posts result back to hook"]
    G --> H["Hook resolves promise and returns output to component"]
```

* Demonstrates the **end-to-end flow** of calling any WASM function via the hook.

## Summary

* `useWasmWorker` exposes **all WASM functions dynamically** through the generic `call` method.
* TypedArrays must be specified in `bufferKeys` and argument **order must match C++ signature**.
* New functions require both **C++ export** and proper handling in `wasmWorker.js`.
* Handles memory allocation, result copying, and cleanup automatically.
* Provides safe, asynchronous access to WASM from React.
>>>>>>> feat/bilater_filter_gpu
