#ifndef EXPORTED_H
#define EXPORTED_H

#ifdef __cplusplus // Standard C++ compilation (avoid name mangling)
  #define EXPORTED extern "C"
#else // Standard C compilation (nothing)
  #define EXPORTED
#endif

#endif // EXPORTED_H
