#ifndef EXPORTED_H
#define EXPORTED_H

// Macro to export functions for WASM

// Emscripten (Web Assembly) compilation (avoid name mangling & instruct emscripten to keep it)
#include <emscripten/emscripten.h>

#define EXPORTED extern "C" EMSCRIPTEN_KEEPALIVE

#endif // EXPORTED_H
