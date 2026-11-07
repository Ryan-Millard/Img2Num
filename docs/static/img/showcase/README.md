# Community project images

After approving a submission in the [Showcase discussions](https://github.com/Ryan-Millard/Img2Num/discussions/categories/showcase), save its attached images in a project-specific directory here, for example `project-name/screenshot.png` and `project-name/logo.png`.

- Recommend a **1200 × 675 px (16:9)** screenshot in PNG, JPEG, or WebP format. Cards fit the full image within a consistent 16:9 frame.
- A square logo is optional. Without one, the card uses a Lucide code icon.
- Use lowercase, hyphenated filenames. Optimize images before committing them.
- Add the accepted project to `docs/src/data/showcase.js`. Name, description, binding, and live URL are required. The screenshot, logo, source URL, and additional labeled links are optional. If supplied, screenshots and logos must use local paths.
- Use site-relative paths such as `/img/showcase/project-name/screenshot.png`; external image URLs are rejected.
- Run `node --test docs/tests/showcase.test.mjs` from the repository root. It checks the data validation, submission URL, and existence of listed images.

The submission page opens a prefilled discussion. Contributors attach images in GitHub's editor before posting; the site does not upload files or publish discussions automatically. Only accepted entries belong in the showcase data.
