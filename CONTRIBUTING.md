# Contributing to Img2Num

Want to contribute to Img2Num? There are a few things you need to know.

We wrote a [contribution guide](https://img2num.dev/docs/contributing) to help you get started.

**A few important points:**

- **Add tests** with your PR — new features and bug fixes **must** include tests where appropriate. PRs without tests are unlikely to be approved.
- Follow the repository's coding style rules.
- Use the issue and PR templates when filing issues or submitting code. Your PR will be rejected if you don't.

## Running the standalone C++ smoke test

The CPU-only test build compiles the needed core sources directly and does not build the
production core target or require Dawn. Configure and run it with:

```sh
cmake -S . -B build-tests -DIMG2NUM_BUILD_TESTS=ON
cmake --build build-tests
ctest --test-dir build-tests --output-on-failure
```

Catch2 v3 is fetched by CMake only when `IMG2NUM_BUILD_TESTS=ON`.

If you're unsure what to change, [open a discussion](https://github.com/Ryan-Millard/Img2Num/discussions/new/choose) and someone will assist you.

## Questions?

If you have questions or need help:
- Join our [Discord](https://discord.com/invite/BHjxcCqAnU)
- Check the [FAQ](https://img2num.dev/faq/) for answers to common questions.
- Open a [discussion](https://github.com/Ryan-Millard/Img2Num/discussions)
- Create an [issue](https://github.com/Ryan-Millard/Img2Num/issues)
- Check existing PRs for ideas

Thank you for improving Img2Num! 🎨🚀
