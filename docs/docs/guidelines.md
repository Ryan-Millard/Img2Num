---
id: guidelines
title: Guidelines
sidebar_position: 7
---

To save everyone time and energy, we try to keep the code, commits, pull requests, and issues on the repository as uniform as possible - 
and, as a contributor, that starts with you!

:::tip

Try your best to stick to the guidelines outlined in this section because it makes it easier for others to work with you and may even save you one day.

:::

## Coding Style

## Commits

:::info

Write clear, concise commit messages in the format below:

  `<type>(<scope>): <subject>`

  - `<body>`

:::

Explanation:
- `type`:
  - **feat** (for new features)
  - **fix** (for bug fixes)
  - **docs** (for **documentation only** changes)
  - **style** (for style updates - e.g. linting)
  - **refactor** (for changes to existing code that don't drastically change behavior)
  - **test** (for new code tests)
  - **chore** (for chore-related tasks - e.g. code cleanup)
- `scope`: area of the code (e.g., wasm, frontend)
- `body`: brief descriptions of what changed

- Reference issues when applicable: e.g. "Fixes #123".
- Keep commits atomic and tiny - change one thing, then commit.

## Pull Requests

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Make and commit your changes.
3. Push to your fork:
   ```bash
   git push origin feature/your-feature
   ```
4. Open a pull request against `main`:
    - Use a clear, descriptive title.
    - Write a meaningful description summarizing what you changed and why.
5. Wait for review. Address feedback by pushing additional commits.
    - When requested, address feedback by pushing additional commits to the same branch.

:::tip[Pull Request Tips]

- Keep the branch associated with your pull request up-to-date with `main` using `git pull`.
  - This prevents it from falling behind and causing merge conflicts.
- Keep pull requests focused and small.
- Screenshots or GIFs are appreciated for UI-visible changes.
- Avoid mixing unrelated changes in the same PR.
- Reference issues when applicable to make them traceable and easy to maintain, e.g.:
  ```bash title="Place this in the body of your pull request"
  Fixes #123
  ```
:::
