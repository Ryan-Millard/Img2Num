#include "img2num/Error.h"

namespace img2num {
thread_local Error last_error{Error::OK};
thread_local std::string last_error_message{};

void clear_last_error() {
    last_error = Error::OK;
    last_error_message.clear();
}

void set_error(Error code, const std::string message) {
    last_error = code;
    last_error_message = message;
}
}  // namespace img2num
