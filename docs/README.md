
# Website

This docs site is built using **Docusaurus** and shares the same branding and glassmorphic design system as the main Img2Num website.

## Setup

Install dependencies:

```bash
yarn

```

## Local Development (Docs)

Run the docs site locally to preview style and layout changes:

```bash
yarn start

```

The site will be available at `http://localhost:3000` and updates live as you edit files.

## Styling Notes

* Global styles live in `docs/src/css/custom.css`
* Glassmorphic components use the reusable `.glass-card` class
* Logo, favicon, and social preview assets are under `docs/static/img/`
* Theme configuration is managed in `docs/docusaurus.config.js`

## Build

```bash
yarn build

```

## Deployment (GitHub Pages)

```bash
GIT_USER=<your-github-username> yarn deploy

```

If you are using GitHub Pages for hosting, this command builds the site and pushes it to the `gh-pages` branch.


