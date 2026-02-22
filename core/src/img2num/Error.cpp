#include "img2num/Error.h"

namespace img2num {
    void clear_last_error() {
        last_error = Error::OK;
        last_error_message.clear();
    }

    void set_error(Error code, const std::string message) {
        last_error = code;
        last_error_message = message;
    }
}
