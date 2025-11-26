# Contributing to Img2Num

First off, thank you for considering contributing to Img2Num! We welcome any kind of contribution—bug reports, feature requests, documentation improvements, code fixes, or optimizations. This document outlines the process for contributing, from setting up your development environment to submitting pull requests.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Reporting Issues](#reporting-issues)
3. [Development Setup](#development-setup)
4. [Building the Project](#building-the-project)
   - [WASM Components](#wasm-components)
   - [Frontend (React + Vite)](#frontend-react--vite)

5. [Running the Application](#running-the-application)
6. [Linting & Formatting](#linting--formatting)
7. [Testing & Debugging](#testing--debugging)
8. [Commit Guidelines](#commit-guidelines)
9. [Pull Request Process](#pull-request-process)
10. [Additional Resources](#additional-resources)

## Code of Conduct

Please review and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) to help foster an open and welcoming environment.

## Reporting Issues

If you encounter a bug or have a feature request, please open an issue at:

https://github.com/Ryan-Millard/Img2Num/issues

_When reporting issues:_

- Use a descriptive title.
- Include steps to reproduce, expected behavior, and actual behavior.
- Attach screenshots or logs if applicable.
- Specify your environment (OS, Node.js version, browser).

## Development Setup

1. _Clone the repository_

   bash
   git clone https://github.com/Ryan-Millard/Img2Num.git
   cd Img2Num

2. _Install dependencies_

   bash
   npm install

3. _Prerequisites_
   - [Node.js](https://nodejs.org/) (>= 16.x)
   - [Emscripten](https://emscripten.org/) (emcc in your PATH)
   - [Make](https://www.gnu.org/software/make/) or compatible build system
   - [Vite](https://vitejs.dev/) (installed via npm install)

## Building the Project

### WASM Components

The C++ code under src/wasm is compiled to WebAssembly.

- _Build release WASM_

  bash
  npm run build-wasm

- _Build debug WASM_ (with debug symbols)

  bash
  npm run build-wasm:debug

- _Clean WASM artifacts_

  bash
  npm run clean-wasm

> These scripts invoke the Makefile in src/wasm (see make -C src/wasm help).

### Frontend (React + Vite)

- _Development build_

  bash
  npm run dev

- _Development with debug WASM_

  bash
  npm run dev:debug

- _Production build_

  bash
  npm run build

- _Preview production build_

  bash
  npm run preview

- _Clean all build artifacts_

  bash
  npm run clean

## Running the Application

After building, launch the dev server:

bash
npm run dev

Open your browser and navigate to http://localhost:5173 (or as indicated in the console).

## Linting & Formatting

We use ESLint to maintain code quality.

- _Run linter_

  bash
  npm run lint

- _Auto-fix lint issues_

  bash
  npm run lint:fix

Our ESLint configuration is in eslint.config.js. Please ensure all lint checks pass before submitting a PR.

## Testing & Debugging

Currently, there are no formal tests. Use browser dev tools and logging for debugging. Contributions to add unit or integration tests are welcome!

## Commit Guidelines

- Write clear, concise commit messages in the format:

  <type>(<scope>): <subject>

  <body>
  - _type_: feat, fix, docs, style, refactor, perf, test, chore
  - _scope_: area of the code (e.g., wasm, frontend)
  - _subject_: brief description

- Reference issues when applicable: Fixes #123.

- Keep pull requests focused and small.

## Pull Request Process

1. Fork the repository and create a feature branch:

   bash
   git checkout -b feature/your-feature

2. Commit changes to your branch.
3. Push to your fork:

   bash
   git push origin feature/your-feature

4. Open a pull request against main with a descriptive title and description.
5. Wait for review. Address feedback by pushing additional commits.

## Additional Resources

- [README](./README.md)
- [Makefile (WASM build instructions)](src/wasm/Makefile)
- [Vite Config](./vite.config.js)
- [ESLint Config](./eslint.config.js)

Thank you for improving Img2Num! 🎨🚀
