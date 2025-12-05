---
id: commits
title: 🎨 Commits
sidebar_position: 4
---

## 📝 Commits
:::info
Format: `<type>(<scope>): <subject>`
Optional body below. Reference issues: `Fixes #123`
:::

## Types
| Type     | Description                                      |
|----------|--------------------------------------------------|
| **feat** | A new feature                                   |
| **fix**  | A bug fix                                       |
| **docs** | Documentation only                              |
| **style**| Formatting, linting, whitespace changes only    |
| **refactor** | Code changes without affecting functionality |
| **test** | Adding or updating tests                        |
| **chore**| Maintenance tasks (dependencies, build tools)  |

:::important

Commits should be **atomic**, addressing one logical change per commit. Always check `.editorconfig` before committing.

:::


## Examples
- Commits must be **atomic** (one logical change per commit)
- Always check `.editorconfig` before committing

### [Version bump](https://github.com/Ryan-Millard/Img2Num/commit/426ac4f655343b06429b5f976e794b448f1afa0f)
```bash
chore(deps-dev): Bump prettier from 3.7.1 to 3.7.3 in the all-npm group

Bumps the all-npm group with 1 update: [prettier](https://github.com/prettier/prettier).


Updates `prettier` from 3.7.1 to 3.7.3
- [Release notes](https://github.com/prettier/prettier/releases)
- [Changelog](https://github.com/prettier/prettier/blob/main/CHANGELOG.md)
- [Commits](https://github.com/prettier/prettier/compare/3.7.1...3.7.3)

---
updated-dependencies:
- dependency-name: prettier
  dependency-version: 3.7.3
  dependency-type: direct:development
  update-type: version-update:semver-patch
  dependency-group: all-npm
...

Signed-off-by: dependabot[bot] <support@github.com>
```

### [Additional WASM image processing function](https://github.com/Ryan-Millard/Img2Num/commit/1b85d2d1fc358f10d1a122d988c6a94b275bac9a)
```bash
feat(Merge Small Regions): Detect & merge regions in processed images that are difficult to click
```

### [React Helmet & index.html wrapper + SEO images](https://github.com/Ryan-Millard/Img2Num/commit/3d090919dae749d884a0413b07a8897d0478e8eb)
```bash
feat(HTML head tags): Add proper head tags & favicon.svg

        - react-helmet for all pages
        - basic index.html
        - add favicon.svg & og-icon.png
```

### [Basic SEO - sitemap & robots.txt](https://github.com/Ryan-Millard/Img2Num/commit/de420c0bd2a323341b425776c7e5096f8f6a726d)
```bash
create(robots.txt, automatic sitemap): Basic robots.txt & vite-plugin-sitemap
```

### [Change React's routing system & add redirect on route not found](https://github.com/Ryan-Millard/Img2Num/commit/02f70f268c9605b50882368958df9b097e173be0)
```bash
update(main.jsx, 404.html): Switch to BrowserRouter and redirect on 404
```

### [Fallback for users who can't run JavaScript](https://github.com/Ryan-Millard/Img2Num/commit/f07c6c60e67f36be955ad850e96f4d234c4a5264)
```bash
update(index.html): Add noscript fallback for users with js disabled
```

### [Remove dynamic code from Credits page to allow it to be statically generated](https://github.com/Ryan-Millard/Img2Num/commit/645aea4375d33f6c3223da78efb55ecda21c9f4f)
```bash
refactor(Credits Page): Contributors card now fully static
```
