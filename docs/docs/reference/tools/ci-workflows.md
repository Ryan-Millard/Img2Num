---
sidebar_position: 2
title: CI/CD Workflows
description: Documentation for GitHub Actions workflows used in Img2Num's continuous integration and deployment pipeline
keywords: [CI, CD, GitHub Actions, workflows, automation, testing, linting]
---

# CI/CD Workflows

Img2Num uses GitHub Actions for continuous integration and deployment. This page documents the workflows that run automatically on pull requests and pushes to main.

## Workflows Overview

### Lint Workflow

**File**: `.github/workflows/ci.yml` (lint job)

**Triggers**:
- Pull requests to `main`
- Pushes to `main`

**Purpose**: Ensures all code meets our style and quality standards before merging.

**Steps**:
1. Checkout code
2. Setup Node.js 22 with npm caching
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Run editorconfig-checker (`npm run lint:style`)

**What it checks**:
- JavaScript/React code quality (ESLint)
- Code style consistency (indentation, line endings, etc.)
- EditorConfig compliance

**Failure conditions**: The workflow fails if any linting errors are detected.

---

### Script Validation Workflow

**File**: `.github/workflows/ci.yml` (validate-scripts job)

**Triggers**:
- Pull requests to `main` (when scripts are modified)
- Pushes to `main` (when scripts are modified)

**Purpose**: Validates that every npm script has corresponding documentation in `package.json`'s `scriptsInfo` section.

**Smart detection**: Only runs when:
- `package.json` or `docs/package.json` changes include `scriptsInfo` modifications
- Files under `scripts/` or `docs/scripts/` are modified

**Steps**:
1. Detect if script-related files changed
2. If yes, run `npm run validate-scripts`
3. Comment on PR if validation fails (with error details)

---

## Running CI Checks Locally

To verify your changes will pass CI before pushing:

```bash
# Run all lint checks
npm ci
npm run lint
npm run lint:style

# Validate scripts (if you modified scripts)
npm run validate-scripts
```

## Troubleshooting CI Failures

### Lint Job Fails

**Symptoms**: `npm run lint` or `npm run lint:style` fails in CI

**Solutions**:
1. Run the failing command locally:
   ```bash
   npm run lint        # for ESLint errors
   npm run lint:style  # for style errors
   ```
2. Review the error messages
3. Fix issues (use `npm run lint:fix` for auto-fixable ESLint issues)
4. Commit and push fixes

### Script Validation Fails

**Symptoms**: `validate-scripts` job fails

**Solutions**:
1. Ensure every script in `package.json` has an entry in `scriptsInfo`
2. Run `npm run validate-scripts` locally to see specific errors
3. Add missing `scriptsInfo` entries or remove unused scripts
4. See [Project Scripts](../../project-scripts/overview.md) for more details

## Workflow Configuration

### Node.js Version

All workflows use **Node.js 22** to match the project's runtime environment.

### Caching

npm dependencies are cached to speed up workflow runs:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
```

### Conditional Execution

The `validate-scripts` job only runs when necessary, saving CI resources:
- Checks git diff for relevant file changes
- Uses `if: steps.check_changes.outputs.scripts_changed == 'true'`

## Best Practices

1. **Run checks locally first**: Don't rely on CI to catch issues
2. **Keep commits lint-clean**: Fix linting issues before pushing
3. **Review CI logs**: If CI fails, read the full error output
4. **Ask for help**: If stuck, open a [discussion](https://github.com/Ryan-Millard/Img2Num/discussions) or comment on your PR

## Future Enhancements

Planned improvements to CI workflows:
- Unit test automation
- Build verification
- Deployment automation
- Code coverage reporting

:::info Contributing to CI
If you want to improve or add new workflows, please open an issue first to discuss your ideas with the maintainers.
:::
