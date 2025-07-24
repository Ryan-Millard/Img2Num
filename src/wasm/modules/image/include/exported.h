#ifndef EXPORTED_H
#define EXPORTED_H

// Macro to export functions for WASM or other C compilers

#ifdef __EMSCRIPTEN__ // Emscripten (Web Assembly) compilation (avoid name mangling & instruct emscripten to keep it)
#include <emscripten/emscripten.h>
#define EXPORTED extern "C" EMSCRIPTEN_KEEPALIVE
#else // Standard C++ compilation (avoid name mangling)
#ifdef __cplusplus
#define EXPORTED extern "C"
#else // Standard C compilation (nothing)
#define EXPORTED
#endif
#endif

#endif // EXPORTED_H
