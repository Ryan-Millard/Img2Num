# =================================================================
# Img2Num Top-Level (Manages all libs and apps)
# =================================================================
cmake_minimum_required(VERSION 3.16)
project(Img2NumRootManager LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Ensure we strictly conform to the C++17 standard
# This is important for inter-OS reproducibility
set(CMAKE_CXX_EXTENSIONS OFF)

# Reusable flags to ensure good quality code
set(IMG2NUM_STRICT_CXX_FLAGS
    $<$<AND:$<COMPILE_LANGUAGE:CXX>,$<OR:$<CXX_COMPILER_ID:GNU>,$<CXX_COMPILER_ID:Clang>,$<CXX_COMPILER_ID:AppleClang>>>:-Wpedantic -Werror=pedantic -Werror=c++20-extensions>
    $<$<AND:$<COMPILE_LANGUAGE:CXX>,$<CXX_COMPILER_ID:MSVC>>:/permissive->
)

option(IMG2NUM_BUILD_C "Build C bindings (required for WASM builds)" ON)
option(IMG2NUM_BUILD_PYTHON "Build Python bindings" OFF)
option(IMG2NUM_BUILD_EXAMPLES "Build example applications" ON)
option(IMG2NUM_DEBUG_CACHE_VARIABLES_DUMP "Dump CMake environment variables in Debug mode" ON)
option(IMG2NUM_ENABLE_DEBUG_LOGGING "Compile with debug logs allowed to show in the console" ON)

# Force a safe default to avoid the weirdness of CMake's `None`
if(NOT CMAKE_BUILD_TYPE OR CMAKE_BUILD_TYPE STREQUAL "")
  message(STATUS "CMAKE_BUILD_TYPE unspecified - defaulting to \"Release\"")
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Choose the type of build" FORCE)
endif()

# Debug variable dump during "cmake -B..."
block()
if(IMG2NUM_DEBUG_CACHE_VARIABLES_DUMP)
  string(ASCII 27 ESC)
  set(COLOR_MAGENTA "${ESC}[35m")
  set(COLOR_CYAN "${ESC}[36m")
  set(COLOR_RESET "${ESC}[0m")

  message(STATUS "===============================================================")
  message(STATUS "IMG2NUM_DEBUG_CACHE_VARIABLES_DUMP Output:")
  message(STATUS "===============================================================")

  get_cmake_property(_vars CACHE_VARIABLES)
  list(SORT _vars)

  foreach(_var ${_vars})
    string(TOUPPER "${_var}" _var_upper)

    if(_var MATCHES "^IMG2NUM")
      message(STATUS "[User-Defined] ${COLOR_MAGENTA}${_var}=${${_var}}${COLOR_RESET}")
    elseif(_var_upper MATCHES "^IMG2NUM")
      message(STATUS "[Auto] ${COLOR_CYAN}${_var}=${${_var}}${COLOR_RESET}")
    endif()
  endforeach()

  foreach(_var ${_vars})
    string(TOUPPER "${_var}" _var_upper)

    if(NOT _var_upper MATCHES "^IMG2NUM")
      message(STATUS "${_var}=${${_var}}")
    endif()
  endforeach()

  message(STATUS "===============================================================\n\n")
endif()
endblock()

# ================================================
# Library setup

# Always add core because everything depends on it
add_subdirectory(core)

if(IMG2NUM_BUILD_PYTHON)
  # Python depends only on core
  add_subdirectory(bindings/py)
elseif(IMG2NUM_BUILD_C AND NOT EMSCRIPTEN)
  # C depends only on core
  add_subdirectory(bindings/c)
elseif(EMSCRIPTEN)
  # Check if the user tried to disable C bindings under Emscripten
  if(NOT IMG2NUM_BUILD_C)
    string(ASCII 27 ESC)
    set(COLOR_RED "${ESC}[31m")
    set(COLOR_RESET "${ESC}[0m")
    message(WARNING 
      "${COLOR_RED}IMG2NUM_BUILD_C was disabled under Emscripten! "
      "WebAssembly compilation absolutely requires the C bindings. "
      "Forcing IMG2NUM_BUILD_C=ON to prevent a broken build.${COLOR_RESET}"
    )
    # Force the option back to ON in the cache
    set(IMG2NUM_BUILD_C ON CACHE BOOL "Build C bindings" FORCE)
  endif()

  # WebAssembly relies on C
  add_subdirectory(bindings/c)
  add_subdirectory(bindings/js)
endif()

# ================================================
# Example apps (Emscripten can't compile them)
if(NOT EMSCRIPTEN AND IMG2NUM_BUILD_EXAMPLES)
  add_subdirectory(example-apps/console-cpp)

  if(IMG2NUM_BUILD_C)
    add_subdirectory(example-apps/console-c)
  endif()
endif()
