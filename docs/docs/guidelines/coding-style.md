---
id: coding-style
title: 📝 Coding Style
sidebar_position: 3
---

## 🌐General Rules

- **Follow `.editorconfig`** exactly:
  - Indent: **2 spaces**
  - Charset: **UTF-8**
  - Line endings: **LF**
  - Max line length: 120 (off for JSON, Markdown, lock files, images)
  - Insert final newline at EOF
  - Trim trailing whitespace (exceptions: JSON, Markdown, YAML, binary, lock files)
- **Use Prettier** for JS/React: `npm run format-js`
- **Use clang-format** for C++: `npm run format-wasm`
- **Lint JS/React**: `npm run lint` and fix with `npm run lint:fix`
- **Do not manually override formatting** outside Prettier/clang-format unless necessary.

## ⚛ JavaScript / React

- Indent: 2 spaces
- Max line length: 120
- Single quotes `'...'`
- Semicolons: required
- Trailing commas: ES5
- JSX: Prettier defaults, `bracketSameLine: true`
- React Hooks rules:
  - `react-hooks/rules-of-hooks: error`
  - `react-hooks/exhaustive-deps: warn`
- Globals: browser

## 💻 C / C++

- Indent: 2 spaces
- Max line length: 120
- **Brace style: Allman** (opening brace on a new line)
- `#include`
  - **angle brackets:** for external libraries (e.g., `iostream`)
  - **quotes:** for internal libraries
- Use namespaces to avoid collisions
- Use `clang-format` (`npm run format-wasm`)

<details>
<summary>Example C++ Header</summary>

```cpp title="exampleFunction.h"
#ifndef EXAMPLE_FUNCTION_H
#define EXAMPLE_FUNCTION_H

#include <cstdint>

namespace exampleNamespace
{
  void exampleFunction(uint8_t x);
}

#endif // EXAMPLE_FUNCTION_H
```

</details>

<details>
<summary>Example C++ Implementation</summary>
```cpp title="exampleFunction.cpp"
#include "exampleFunction.h"
#include "internalLibrary.h"

#include <iostream>

namespace exampleNamespace
{
void exampleFunction(uint8_t x)
{
if (internalLibrary::isPrime(x))
{
std::cout << "Prime" << std::endl;
return;
}

    std::cout << "Non-prime" << std::endl;

}
}

````
</details>

## 🌐 HTML / CSS / Markdown / YAML
- Indent: 2 spaces
- Trim trailing whitespace (except Markdown/YAML)
- Insert final newline
- Max line length: 120 (off for Markdown/YAML)

## 📦 JSON / lock files
- Indent: 2 spaces
- Do **not** trim trailing whitespace
- Final newline: true (lock files: false)
- Max line length: off

## 🖼 Images / Binary Assets
- Charset: binary
- Do not trim trailing whitespace
- No final newline
- Max line length: off

## 🔍 Linting and Style Checks

### Running Lints Locally

Before submitting a pull request, run these commands to ensure your code meets our quality standards:

```bash
# Install dependencies
npm ci

# Run ESLint (JavaScript/React)
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Check code style (indentation, line endings, etc.)
npm run lint:style
````

### What the Linters Check

**ESLint** validates:

- JavaScript/React syntax and best practices
- Potential bugs and code smells
- Consistent code style
- React Hooks rules

**editorconfig-checker** validates:

- Indentation style (spaces vs tabs)
- Line ending consistency (LF)
- Trailing whitespace
- Final newline in files
- Line length limits (120 characters)

### Fixing Lint Issues

1. **Auto-fixable**: Run `npm run lint:fix` to automatically fix most ESLint issues

2. **Manual fixes** required for:
   - Complex indentation errors
   - Line length violations (refactor long lines)
   - Missing final newlines

3. **Editor setup**: Install EditorConfig plugin for your editor:
   - **VS Code**: "EditorConfig for VS Code" extension
   - **Other editors**: See [EditorConfig.org](https://editorconfig.org/)

### Special Cases

- **Makefiles**: Must use tabs (not spaces) for indentation
- **Binary files**: Linting does not apply to images, compiled files, etc.

### CI Integration

All pull requests automatically run linting checks. If the lint job fails:

1. Review the CI logs
2. Fix issues locally using the commands above
3. Commit and push your fixes
4. The CI will automatically re-run

:::tip Current Status
The project has some existing lint violations being addressed incrementally. Focus on keeping your changes lint-clean. Don't feel obligated to fix unrelated issues!
:::
