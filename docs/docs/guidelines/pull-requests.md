---
id: pull-requests
title: 🔀 Pull Requests
sidebar_position: 6
---

## Fork the repo & create a feature branch:

```bash title="Switch to a new branch"
git checkout -b feat/your-feature
```

## Make commits following guidelines

These can be found in the [previous section](../commits).

## Push to your fork:

:::danger Danger: **Merge Conflicts**

Keep your branch **up-to-date with [main](https://github.com/Ryan-Millard/Img2Num/tree/main)** to avoid conflicts

```bash title="Use this to avoid merge conflicts"
git pull origin main
```

:::

```bash title="Push your code to your fork"
git push origin feat/your-feature
```

## Open PR against `main`:

Make sure it has:

- A clear title
- A summary of changes & motivation
- References to related issues: `Fixes #123`

## Address review feedback by pushing more commits to same branch

:::tip Pull Request Tips

- Use the pull request templates to help you structure the bodies of your pull requests
- Keep PRs **small and focused**
- Include **screenshots or GIFs** for UI changes
- Avoid mixing unrelated changes

:::
