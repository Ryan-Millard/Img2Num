#include "img2num/Error.h"
#include "internal/gpu.h"

#ifdef IMG2NUM_TEST_C_BINDINGS
#include "cimg2num/img2num_error_t.h"
#endif

#include <exception>
#include <iostream>
#include <stdexcept>
#include <string>
#include <string_view>
#include <type_traits>

namespace {
/**
 * @brief Verify a test condition with checks that remain active in Release builds.
 * @param condition Condition that must hold for the check to pass.
 * @param message Failure diagnostic to report if the condition is false.
 * @throws std::runtime_error If @p condition is false.
 */
void check(bool condition, const std::string& message) {
    if (!condition) {
        throw std::runtime_error(message);
    }
}

/**
 * @brief Verify an operation throws std::invalid_argument with the expected shader diagnostic.
 * @tparam Func Callable type of the operation under test.
 * @param operation Operation expected to throw std::invalid_argument.
 * @param id Complete shader ID expected in the quoted diagnostic.
 * @return The exception's diagnostic message.
 * @throws std::runtime_error If no std::invalid_argument is thrown or its diagnostic omits
 * the function name, quoted shader ID, or lookup failure reason. Other exception types propagate.
 */
template <typename Func>
std::string expect_invalid_argument(Func&& operation, std::string_view id) {
    try {
        operation();
    } catch (const std::invalid_argument& error) {
        const std::string message = error.what();
        check(
            message.find("GPU::readWGSLFile") != std::string::npos,
            "Diagnostic must identify GPU::readWGSLFile: " + message
        );
        check(
            message.find("unknown shader id '" + std::string(id) + "'") != std::string::npos,
            "Diagnostic must contain the complete quoted shader ID: " + message
        );
        check(
            message.find("not found in embedded shaders") != std::string::npos,
            "Diagnostic must explain the lookup failure: " + message
        );
        return message;
    }
    throw std::runtime_error(
        "Expected std::invalid_argument for shader ID '" + std::string(id) + "'"
    );
}
} // namespace

/**
 * @brief Run shader lookup and error-boundary regression checks without initializing a GPU.
 * @return Zero if all checks pass, or one after reporting a regression failure.
 */
int main() {
    try {
        auto& gpu = GPU::getClassInstance();
        check(!gpu.is_initialized() && !gpu.get_instance(), "Tests require an uninitialized GPU");
        static_assert(std::is_same_v<decltype(gpu.readWGSLFile("")), std::string>);
        const std::string unknown_id = "issue299_missing_shader_full_id";
        check(!embedded_shaders::shaders.empty(), "Embedded shader table must not be empty");
        for (const auto& entry : embedded_shaders::shaders) {
            check(entry.id != unknown_id, "Test shader ID must be absent from the shader table");
            check(
                gpu.readWGSLFile(entry.id) == entry.source,
                "Shader source changed for ID '" + std::string(entry.id) + "'"
            );
        }
        expect_invalid_argument([&] { gpu.readWGSLFile(unknown_id); }, unknown_id);
        expect_invalid_argument([&] { gpu.readWGSLFile(""); }, "");

        // The view ends before the backing string's terminator and suffix.
        const std::string backing = unknown_id + "_excluded_suffix";
        const std::string_view bounded_id(backing.data(), unknown_id.size());
        const auto bounded_message =
            expect_invalid_argument([&] { gpu.readWGSLFile(bounded_id); }, bounded_id);
        check(
            bounded_message.find("_excluded_suffix") == std::string::npos,
            "Diagnostic read beyond the supplied string_view"
        );

        const auto& valid_entry = embedded_shaders::shaders.front();
        const std::string valid_backing = std::string(valid_entry.id) + "_excluded_suffix";
        check(
            gpu.readWGSLFile(std::string_view(valid_backing.data(), valid_entry.id.size())) ==
                valid_entry.source,
            "Bounded valid shader ID did not return its source"
        );

        const auto pipeline_message = expect_invalid_argument(
            [&] { gpu.createPipeline(unknown_id, "issue299 pipeline lookup"); }, unknown_id
        );
        check(
            !gpu.is_initialized() && !gpu.get_instance(),
            "Pipeline lookup failure must not initialize the GPU"
        );

        img2num::set_error(img2num::Error::RUNTIME, "stale error");
        img2num::clear_last_error_and_catch([&] {
            gpu.createPipeline(unknown_id, "issue299 error boundary");
        });
        check(
            img2num::get_last_error() == img2num::Error::INVALID_ARGUMENT,
            "Error boundary must preserve the invalid-argument category"
        );
        check(
            img2num::get_last_error_message() == pipeline_message,
            "Error boundary must preserve the complete diagnostic"
        );
#ifdef IMG2NUM_TEST_C_BINDINGS
        check(
            img2num_get_last_error() == IMG2NUM_ERROR_INVALID_ARGUMENT,
            "C error getter must expose the invalid-argument category"
        );
        check(
            img2num_get_last_error_message() == pipeline_message,
            "C error getter must expose the complete diagnostic"
        );
        img2num_clear_last_error();
        check(
            img2num_get_last_error() == IMG2NUM_OK &&
                std::string(img2num_get_last_error_message()).empty(),
            "C error state must clear after the failure"
        );
#endif
        img2num::clear_last_error();
        img2num::clear_last_error_and_catch([&] { gpu.readWGSLFile(valid_entry.id); });
        check(
            img2num::get_last_error() == img2num::Error::OK &&
                img2num::get_last_error_message().empty(),
            "Successful lookup must leave the error boundary clear"
        );
        std::cout << "Shader lookup regression checks passed\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "Shader lookup regression failed: " << error.what() << '\n';
        return 1;
    }
}
