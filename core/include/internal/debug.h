#pragma once

#ifndef EMSCRIPTEN
#include <spdlog/spdlog.h>
#define IMG2NUM_LOG_INFO(...) spdlog::info(__VA_ARGS__)
#define IMG2NUM_LOG_WARN(...) spdlog::warn(__VA_ARGS__)
#define IMG2NUM_LOG_ERROR(...) spdlog::error(__VA_ARGS__)
#define IMG2NUM_LOG_DEBUG(...) spdlog::debug(__VA_ARGS__)
#else
#define IMG2NUM_LOG_INFO(...)                                                                      \
    do {                                                                                           \
    } while (0)
#define IMG2NUM_LOG_WARN(...)                                                                      \
    do {                                                                                           \
    } while (0)
#define IMG2NUM_LOG_ERROR(...)                                                                     \
    do {                                                                                           \
    } while (0)
#define IMG2NUM_LOG_DEBUG(...)                                                                     \
    do {                                                                                           \
    } while (0)
#endif
