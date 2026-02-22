#include "cimg2num/img2num_error_t.h"

#include <cstring>

#include "img2num/Error.h"

static inline img2num_error_t cpp_error_to_c_error(img2num::Error cpp_error) {
    static_assert(static_cast<int>(img2num::Error::OK) == IMG2NUM_OK, "enum mismatch");
    static_assert(static_cast<int>(img2num::Error::BAD_ALLOC) == IMG2NUM_ERROR_BAD_ALLOC,
                  "enum mismatch");
    static_assert(
        static_cast<int>(img2num::Error::INVALID_ARGUMENT) == IMG2NUM_ERROR_INVALID_ARGUMENT,
        "enum mismatch");
    static_assert(static_cast<int>(img2num::Error::RUNTIME) == IMG2NUM_ERROR_RUNTIME,
                  "enum mismatch");
    static_assert(static_cast<int>(img2num::Error::UNKNOWN) == IMG2NUM_ERROR_UNKNOWN,
                  "enum mismatch");

    return static_cast<img2num_error_t>(cpp_error);
}

extern "C" {
img2num_error_t img2num_get_last_error() {
    const img2num::Error cpp_err{img2num::get_last_error()};
    return cpp_error_to_c_error(cpp_err);
}

const char* img2num_get_last_error_message() {
    static thread_local std::string msg;
    msg = img2num::get_last_error_message();
    return msg.c_str();
}

void img2num_clear_last_error() {
    img2num::clear_last_error();
}
}
