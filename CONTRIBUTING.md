# Contributing to Img2Num

First off, thank you for considering contributing to Img2Num! We welcome any kind of contribution—bug reports, feature requests, documentation improvements, code fixes, or optimizations. This document outlines the process for contributing, from setting up your development environment to submitting pull requests.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Reporting Issues](#reporting-issues)
3. [Development Setup](#development-setup)
4. [Building the Project](#building-the-project)

   * [WASM Components](#wasm-components)
   * [Frontend (React + Vite)](#frontend-react--vite)
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


*When reporting issues:*

* Use a descriptive title.
* Include steps to reproduce, expected behavior, and actual behavior.
* Attach screenshots or logs if applicable.
* Specify your environment (OS, Node.js version, browser).

## Development Setup

1. *Clone the repository*

   bash
   git clone https://github.com/Ryan-Millard/Img2Num.git
   cd Img2Num
   

2. *Install dependencies*

   bash
   npm install
   

3. *Prerequisites*

   * [Node.js](https://nodejs.org/) (>= 16.x)
   * [Emscripten](https://emscripten.org/) (emcc in your PATH)
   * [Make](https://www.gnu.org/software/make/) or compatible build system
   * [Vite](https://vitejs.dev/) (installed via npm install)

## Building the Project

### WASM Components

The C++ code under src/wasm is compiled to WebAssembly.

* *Build release WASM*

  bash
  npm run build-wasm
  

* *Build debug WASM* (with debug symbols)

  bash
  npm run build-wasm:debug
  

* *Clean WASM artifacts*

  bash
  npm run clean-wasm
  

> These scripts invoke the Makefile in src/wasm (see make -C src/wasm help).

### Frontend (React + Vite)

* *Development build*

  bash
  npm run dev
  

* *Development with debug WASM*

  bash
  npm run dev:debug
  

* *Production build*

  bash
  npm run build
  

* *Preview production build*

  bash
  npm run preview
  

* *Clean all build artifacts*

  bash
  npm run clean
  

## Running the Application

After building, launch the dev server:

bash
npm run dev


Open your browser and navigate to http://localhost:5173 (or as indicated in the console).

## Linting & Formatting

We use ESLint to maintain code quality.

* *Run linter*

  bash
  npm run lint
  

* *Auto-fix lint issues*

  bash
  npm run lint:fix
  

Our ESLint configuration is in eslint.config.js. Please ensure all lint checks pass before submitting a PR.

## Testing & Debugging

Currently, there are no formal tests. Use browser dev tools and logging for debugging. Contributions to add unit or integration tests are welcome!

## Commit Guidelines

* Write clear, concise commit messages in the format:

  
  <type>(<scope>): <subject>

  <body>
  

  * *type*: feat, fix, docs, style, refactor, perf, test, chore
  * *scope*: area of the code (e.g., wasm, frontend)
  * *subject*: brief description

* Reference issues when applicable: Fixes #123.

* Keep pull requests focused and small.

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

* [README](./README.md)
* [Makefile (WASM build instructions)](src/wasm/Makefile)
* [Vite Config](./vite.config.js)
* [ESLint Config](./eslint.config.js)

Thank you for improving Img2Num! 🎨🚀
