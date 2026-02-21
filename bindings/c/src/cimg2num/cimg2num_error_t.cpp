#include "cimg2num/cimg2num_error_t.h"

extern "C" {

// Thread-local error state
namespace {
    void clear_last_error_state() {
        cimg2num::last_error = IMG2NUM_OK;
        cimg2num::last_error_message[0] = '\0';
    }
}

// Error API implementation
img2num_error_t img2num_get_last_error(void) {
    return cimg2num::last_error;
}

const char* img2num_get_last_error_message(void) {
    return cimg2num::last_error_message;
}

void img2num_clear_last_error(void) {
    clear_last_error_state();
}
}
