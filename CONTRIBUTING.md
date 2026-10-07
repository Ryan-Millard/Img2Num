# Contributing to Img2Num

Want to contribute to Img2Num? There are a few things you need to know.

We wrote a [contribution guide](https://img2num.dev/docs/contributing) to help you get started.

**A few important points:**

- **Add tests** with your PR — new features and bug fixes **must** include tests where appropriate. PRs without tests are unlikely to be approved.
- Follow the repository's coding style rules.
- Use the issue and PR templates when filing issues or submitting code. Your PR will be rejected if you don't.

If you're unsure what to change, [open a discussion](https://github.com/Ryan-Millard/Img2Num/discussions/new/choose) and someone will assist you.

## README Generation

The package README contains generated Node.js examples sourced from the canonical example applications in `example-apps/`.

When updating the ESM or CommonJS example applications, regenerate `packages/js/README.md` with:

```bash
pnpm readme:generate
```

The generated sections are marked with `BEGIN GENERATED` and `END GENERATED` comments. Do not edit the contents of those sections manually; update the canonical example source instead and regenerate the README.

To run the README generator tests:

```bash
pnpm readme:test
```

## Questions?

If you have questions or need help:
- Join our [Discord](https://discord.com/invite/BHjxcCqAnU)
- Check the [FAQ](https://img2num.dev/faq/) for answers to common questions.
- Open a [discussion](https://github.com/Ryan-Millard/Img2Num/discussions)
- Create an [issue](https://github.com/Ryan-Millard/Img2Num/issues)
- Check existing PRs for ideas

Thank you for improving Img2Num! 🎨🚀
