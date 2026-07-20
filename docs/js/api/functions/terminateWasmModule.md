# Function: terminateWasmModule()

URL: https://img2num.dev/docs/js/api/functions/terminateWasmModule

> **terminateWasmModule** (): `Promise` < `void` >

Defined in: wasmModule.js:70

**`Function`**

## Returns

`Promise` < `void` >

A promise that resolves once all resources have been released and the module has been reset to an uninitialized state.

## Description

This function is optional. In most applications, there is no need to call it explicitly, as resources are released when the process exits. It is provided for applications that need to reclaim resources—such as a WebGPU device—before program termination so they can be used elsewhere.

## Async

terminateWasmModule

## Since

0.3.0
