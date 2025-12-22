# Contributing to Img2Num

Want to contribute to Img2Num? There are a few things you need to know.

We wrote a [contribution guide](https://ryan-millard.github.io/Img2Num/info/docs/guidelines/contributing) to help you get started.

## Code Quality and Linting

This project uses automated linting to maintain consistent code style and quality. All pull requests must pass linting checks before they can be merged.

### Running Lints Locally

Before submitting a pull request, run the following commands to ensure your changes meet our code quality standards:

```bash
# Install dependencies first
npm ci

# Run ESLint to check JavaScript/React code
npm run lint

# Auto-fix ESLint issues where possible
npm run lint:fix

# Check code style (indentation, line endings, etc.)
npm run lint:style
```

### Understanding Lint Failures

**ESLint** checks JavaScript and React code for:
- Syntax errors
- Potential bugs
- Code style consistency
- Best practices

**editorconfig-checker** verifies:
- Indentation style (spaces vs tabs)
- Line ending consistency (LF vs CRLF)
- Trailing whitespace
- Final newline in files
- Line length limits (120 characters)

### Fixing Lint Issues

1. **Auto-fixable issues**: Run `npm run lint:fix` to automatically resolve most ESLint issues

2. **Manual fixes**: Some issues require manual intervention:
   - Indentation errors: Ensure consistent spacing (2 spaces for most files)
   - Line endings: Use LF (Unix-style) line endings, not CRLF
   - Line length: Keep lines under 120 characters
   - Final newlines: Ensure files end with a newline character

3. **Editor setup**: Configure your editor to respect the `.editorconfig` file:
   - **VS Code**: Install the "EditorConfig for VS Code" extension
   - **Other editors**: Check [EditorConfig.org](https://editorconfig.org/) for plugins

### Special Cases

**Makefiles**: Use tabs for indentation (as required by Make). Our editorconfig is configured to handle this correctly.

**Binary files**: Linting does not apply to binary assets, images, or compiled files.

### Current Linting Status

> **Note**: The project currently has existing lint violations that are being addressed incrementally. When contributing:
> - Focus on keeping **your new/modified code** lint-clean
> - Don't feel obligated to fix unrelated lint issues (but we appreciate it if you do!)
> - Large-scale lint fixes should be done in separate, focused PRs

### CI/CD Integration

All pull requests automatically run linting checks via GitHub Actions. You can view the results in the "Checks" tab of your PR. If the lint job fails:

1. Review the CI logs to see which files have issues
2. Fix the issues locally using the commands above
3. Commit and push your fixes
4. The CI will automatically re-run

### Questions?

If you encounter linting issues you're unsure how to fix, feel free to:
- Open a draft PR and ask for guidance
- Comment on the relevant issue
- Check existing PRs for examples