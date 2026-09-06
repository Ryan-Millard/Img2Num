#pragma once

#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/spdlog.h>

namespace img2num::third_party_wrappers {

// Lazily-created library logger.
inline spdlog::logger& logger() {
    static const auto instance = [] {
        auto l = spdlog::stdout_color_mt("img2num");
        // Sync runtime filtering with compile-time stripping
        l->set_level(static_cast<spdlog::level::level_enum>(SPDLOG_ACTIVE_LEVEL));
        return l;
    }();
    return *instance;
}

} // namespace img2num::third_party_wrappers

// Library-scoped logging macros. Same compile-time stripping semantics as
// SPDLOG_INFO etc. (SPDLOG_LOGGER_* checks SPDLOG_ACTIVE_LEVEL identically),
// but routed through the img2num logger instead of spdlog's default logger.
#define IMG2NUM_LOG_TRACE(...)                                                                     \
    SPDLOG_LOGGER_TRACE(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
#define IMG2NUM_LOG_DEBUG(...)                                                                     \
    SPDLOG_LOGGER_DEBUG(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
#define IMG2NUM_LOG_INFO(...)                                                                      \
    SPDLOG_LOGGER_INFO(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
#define IMG2NUM_LOG_WARN(...)                                                                      \
    SPDLOG_LOGGER_WARN(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
#define IMG2NUM_LOG_ERROR(...)                                                                     \
    SPDLOG_LOGGER_ERROR(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
#define IMG2NUM_LOG_CRITICAL(...)                                                                  \
    SPDLOG_LOGGER_CRITICAL(&::img2num::third_party_wrappers::logger(), __VA_ARGS__)
