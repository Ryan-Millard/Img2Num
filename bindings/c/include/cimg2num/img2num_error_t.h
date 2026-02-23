#ifndef CIMG2NUM_ERROR_T_H
#define CIMG2NUM_ERROR_T_H

#ifdef __cplusplus
extern "C" {
#endif

// Matches the `core` library's error codes
typedef enum {
    IMG2NUM_OK = 0,
    IMG2NUM_ERROR_BAD_ALLOC = 1,
    IMG2NUM_ERROR_INVALID_ARGUMENT = 2,
    IMG2NUM_ERROR_RUNTIME = 3,
    IMG2NUM_ERROR_UNKNOWN = 4
} img2num_error_t;

img2num_error_t img2num_get_last_error();
const char* img2num_get_last_error_message();
void img2num_clear_last_error();

#ifdef __cplusplus
}
#endif

#endif  // IMG2NUM_ERROR_T_H
