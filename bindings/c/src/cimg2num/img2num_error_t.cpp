#include "cimg2num/img2num_error_t.h"
#include "img2num/Error.h"

#include <cstring>

extern "C" {
static inline img2num_error_t cpp_error_to_c_error(img2num::Error cpp_error) {
    return static_cast<img2num_error_t>(cpp_error);
}

img2num_error_t img2num_get_last_error() {
    const img2num::Error cpp_err {img2num::get_last_error()};
    return cpp_error_to_c_error(cpp_err);
}

const char* img2num_get_last_error_message() {
    static std::string last_error = img2num::get_last_error_message();
    return last_error.c_str();
}

void img2num_clear_last_error() {
    img2num::clear_last_error();
}
}
