#ifndef CIMG2NUM_ERROR_T_H
#define CIMG2NUM_ERROR_T_H

#ifdef __cplusplus
// This is for cimg2num::clear_last_error_and_catch
#include <stdexcept>
#include <utility>
#include <cstring>
#endif

#ifdef __cplusplus
extern "C" {
#endif

// Error codes
typedef enum {
    IMG2NUM_OK = 0,
    IMG2NUM_ERROR_BAD_ALLOC = 1,
    IMG2NUM_ERROR_INVALID_ARGUMENT = 2,
    IMG2NUM_ERROR_RUNTIME = 3,
    IMG2NUM_ERROR_UNKNOWN = 4
} img2num_error_t;

// Error handling functions
img2num_error_t img2num_get_last_error(void);
const char* img2num_get_last_error_message(void);
void img2num_clear_last_error(void);

#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
namespace cimg2num {
    static thread_local img2num_error_t last_error = IMG2NUM_OK;
    static thread_local char last_error_message[512] = {0};

    static inline void set_error(img2num_error_t code, const char* message) {
        last_error = code;
        std::strcpy(last_error_message, message);
        last_error_message[sizeof(last_error_message) - 1] = '\0';
    }

    // Generic function to clear error state and catch exceptions for C++ functions
    template <typename Func, typename... Args>
        void clear_last_error_and_catch(Func&& exception_prone_func, Args&&... args) {
            img2num_clear_last_error(); // Clear any previous error state
            try {
                exception_prone_func(std::forward<Args>(args)...); // Call the passed function with forwarded arguments
            } catch (const std::bad_alloc& e) {
                set_error(IMG2NUM_ERROR_BAD_ALLOC, e.what());
            } catch (const std::invalid_argument& e) {
                set_error(IMG2NUM_ERROR_INVALID_ARGUMENT, e.what());
            } catch (const std::runtime_error& e) {
                set_error(IMG2NUM_ERROR_RUNTIME, e.what());
            } catch (const std::exception& e) {
                set_error(IMG2NUM_ERROR_UNKNOWN, e.what());
            } catch (...) {
                set_error(IMG2NUM_ERROR_UNKNOWN, "Unknown exception occurred");
            }
        }
}
#endif

#endif // IMG2NUM_ERROR_T_H
