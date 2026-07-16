/**
 * @internal
 */

import { getWasmModule } from "./wasmModule.js";

export async function ccallAsync(funcName, argsMap, returnType) {
  const wasmModule = getWasmModule();

  const argTypes = Array(argsMap.size).fill("number");

  const retType = returnType === "void" ? null : "number";

  return wasmModule.ccall(funcName, retType, argTypes, [...argsMap.values()], { async: true });
}
