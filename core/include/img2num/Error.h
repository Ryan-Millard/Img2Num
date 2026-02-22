#ifndef ERROR_H
#define ERROR_H

#include <stdexcept>
#include <string>

namespace img2num {
    enum class Error {
        OK = 0,
        BAD_ALLOC = 1,
        INVALID_ARGUMENT = 2,
        RUNTIME = 3,
        UNKNOWN = 4
    };

    static thread_local Error last_error{Error::OK};
    static thread_local std::string last_error_message{};

    inline Error get_last_error() {
        return last_error;
    }
    inline const std::string get_last_error_message() {
        return last_error_message;
    }
    void clear_last_error();

    void set_error(Error code, const std::string message);

    // Template function for catching and handling exceptions
    template <typename Func, typename... Args>
    void clear_last_error_and_catch(Func&& exception_prone_func, Args&&... args) {
        clear_last_error(); // Clear any previous error state
        try {
            exception_prone_func(std::forward<Args>(args)...); // Call the passed function
        } catch (const std::bad_alloc& e) {
            set_error(Error::BAD_ALLOC, e.what());
        } catch (const std::invalid_argument& e) {
            set_error(Error::INVALID_ARGUMENT, e.what());
        } catch (const std::runtime_error& e) {
            set_error(Error::RUNTIME, e.what());
        } catch (const std::exception& e) {
            set_error(Error::UNKNOWN, e.what());
        } catch (...) {
            set_error(Error::UNKNOWN, "Unknown exception occurred");
        }
    }
}

#endif // ERROR_H
