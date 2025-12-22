<!--TODO: Remove the section below after #93 is merged on 22 Dec 2025 - wait 2 weeks, so remove this on 5 Jan 2026 -->
> [!CAUTION]
> ⚠️⚠️⚠️ **Breaking Change in [PR #93](https://github.com/Ryan-Millard/Img2Num/pull/93)** ⚠️⚠️⚠️
>
> The Makefile behavior is changing soon.
>
> Please read issues [#107](https://github.com/Ryan-Millard/Img2Num/pull/107) and [#109](https://github.com/Ryan-Millard/Img2Num/pull/109) before running the code.

# Img2Num 🦔🖼️➞️🎨

<div align="center">



[![Site Badge](https://img.shields.io/badge/site-online-blue.svg)](https://ryan-millard.github.io/Img2Num/)
[![Docs Badge](https://img.shields.io/badge/docs-online-blue.svg)](https://ryan-millard.github.io/Img2Num/info/)
[![License Badge](https://img.shields.io/badge/license-AGPLv3-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Ryan-Millard/Img2Num?sort=semver)](https://github.com/Ryan-Millard/Img2Num/releases)

[![GitHub stars](https://img.shields.io/github/stars/Ryan-Millard/Img2Num?style=social)](https://github.com/Ryan-Millard/Img2Num/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Ryan-Millard/Img2Num?style=social)](https://github.com/Ryan-Millard/Img2Num/network/members)
[![Contributors](https://img.shields.io/github/contributors/Ryan-Millard/Img2Num)](https://ryan-millard.github.io/Img2Num/credits)
[![GitHub issues](https://img.shields.io/github/issues/Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/issues)



</div>


**Img2Num** converts photos into printable, browser-colourable **colour-by-number** templates using a fast WebAssembly (C++) image pipeline.

> A fast, offline, serverless application that runs at near-native speeds, enabling in-browser colouring or printing of the image.

<table align="center">
  <tr>
    <!-- Top: Big Mountains image -->
    <td align="center" colspan="3">
      <img src="docs/static/img/readme-demo/aerial-view-mountains_colored_pexels-pixabay-51373.jpg" width="400" alt="Mountains Final After Coloring"><br>
      Mountains<br>
      <img src="docs/static/img/readme-demo/aerial-view-mountains_pexels-pixabay-51373.jpg" width="150" alt="Mountains Original Input Image">
      <img src="docs/static/img/readme-demo/aerial-view-mountains_processed_pexels-pixabay-51373.jpg" width="150" alt="Mountains Color-by-Number Template"><br>
      Original + Template
    </td>
  </tr>
  <tr>
    <!-- Bottom: three smaller images -->
    <td align="center">
      <img src="docs/static/img/readme-demo/girl-in-nature_colored_pexels-emmypaw-5461675.jpg" width="250" alt="Girl Final After Coloring"><br>
      Girl in Nature<br>
      <img src="docs/static/img/readme-demo/girl-in-nature_pexels-emmypaw-5461675.jpg" width="100" alt="Girl Original Input Image">
      <img src="docs/static/img/readme-demo/girl-in-nature_processed_pexels-emmypaw-5461675.jpg" width="100" alt="Girl Color-by-Number Template"><br>
      Original + Template
    </td>
    <td align="center">
      <img src="docs/static/img/readme-demo/people_colored_pexels-rdne-6224636.jpg" width="250" alt="People Final After Coloring"><br>
      People<br>
      <img src="docs/static/img/readme-demo/people_pexels-rdne-6224636.jpg" width="100" alt="People Original Input Image">
      <img src="docs/static/img/readme-demo/people_processed_pexels-rdne-6224636.jpg" width="100" alt="People Color-by-Number Template"><br>
      Original + Template
    </td>
    <td align="center">
      <img src="docs/static/img/readme-demo/rio-de-janeiro_colored_pexels-athena-6580703.jpg" width="250" alt="Rio Final After Coloring"><br>
      Rio de Janeiro<br>
      <img src="docs/static/img/readme-demo/rio-de-janeiro_pexels-athena-6580703.jpg" width="100" alt="Rio Original Input Image">
      <img src="docs/static/img/readme-demo/rio-de-janeiro_processed_pexels-athena-6580703.jpg" width="100" alt="Rio Color-by-Number Template"><br>
      Original + Template
    </td>
  </tr>
</table>

### What are you waiting for?
Try it out now by [clicking here](https://ryan-millard.github.io/Img2Num/)!

## What this repository contains (short)

<div align="center"


![React](https://img.shields.io/badge/React-19-blue?logo=react&logoColor=61DAFB)
![C++](https://img.shields.io/badge/C++-Modern-blue?logo=c%2B%2B&logoColor=00599C)
![WebAssembly](https://img.shields.io/badge/WebAssembly-Yes-blue?logo=webassembly)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![CSS](https://img.shields.io/badge/CSS-Modern-blue?logo=css3)


</div>
<div align="center"


![Prettier](https://img.shields.io/badge/Prettier-Code%20Formatter-brightgreen?logo=prettier&logoColor=F7B93E)
![ESLint](https://img.shields.io/badge/ESLint-Linted-yellow?logo=eslint)
![Vitest](https://img.shields.io/badge/Vitest-Tested-orange?logo=vitest)
![Docusaurus](https://img.shields.io/badge/Docusaurus-Docs-blue?logo=docusaurus)
![Concurrently](https://img.shields.io/badge/Concurrently-MultiTask-orange?logo=github-actions)
![EditorConfig](https://img.shields.io/badge/EditorConfig-Style-blue?logo=editorconfig)
![Clang-Format](https://img.shields.io/badge/Clang%20Format-Formatted-blue?logo=clang)



</div>

* A React frontend that handles image input, preview and in-browser colouring.
* A WebAssembly module (C++ → Emscripten) that performs image processing and colour quantisation.

This README is intentionally short — full installation steps, guides and references live in the docs site (see **Essential links** below).

## Essential links (docs site)

Visit the docs site for full guides, API references and troubleshooting:

* Quick start - [https://ryan-millard.github.io/Img2Num/info/docs/getting-started/](https://ryan-millard.github.io/Img2Num/info/docs/introduction/getting-started)
* Guidelines - [https://ryan-millard.github.io/Img2Num/info/docs/category/-guidelines/](https://ryan-millard.github.io/Img2Num/info/docs/category/-guidelines)
* Documentation - [https://ryan-millard.github.io/Img2Num/info/docs/](https://ryan-millard.github.io/Img2Num/info/docs/)
* Reference & Advanced Guides - [https://ryan-millard.github.io/Img2Num/info/docs/reference/](https://ryan-millard.github.io/Img2Num/info/docs/reference/)
* Changelog - [https://ryan-millard.github.io/Img2Num/info/docs/changelog/](https://ryan-millard.github.io/Img2Num/info/changelog)

(These replace long, duplicate instructions in this README to keep maintenance easier.)

## Contributing

We welcome contributions. Please read [CONTRIBUTING.md](https://ryan-millard.github.io/Img2Num/info/docs/guidelines/contributing) and the pinned issues before opening issues or pull requests.

**A few important points:**

* **Add tests** with your PR — new features and bug fixes **must** include tests where appropriate. PRs without tests are unlikely to be approved.
* Follow the repository's [coding style rules](https://ryan-millard.github.io/Img2Num/info/docs/guidelines/coding-style) and [commit message rules](https://ryan-millard.github.io/Img2Num/info/docs/guidelines/commits).
* Use the issue and PR templates when filing issues or submitting code. Your PR will be rejected if you don't.

If you're unsure what to change, open an issue first and we can discuss scope.

## License

[AGPLv3](https://ryan-millard.github.io/Img2Num/info/docs/license)

## What we intentionally keep out of this README

* Long, step‑by‑step build instructions (moved to the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/))
* Full API reference (moved to the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/reference))
* Very large images or heavy explanations — use the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/) for in-depth content

## Can't find something?
Hopefully you understand by now that if you need something, it should be on the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/).
If it isn't, please open a ["New Feature" issue](https://github.com/Ryan-Millard/Img2Num/issues/new?template=feature_request.yml) to request its addition to the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/).

## Maintainers

* [Ryan](https://github.com/Ryan-Millard/)
* [Hayden](https://github.com/hjmillard/) (temporarily unavailable)

> ⚠️ **Disclaimer:** Pull request reviews may take some time as we try to keep up with contributions.  
> We highly encourage everyone to review each other's pull requests where possible — this helps the project move faster and benefits all contributors in the long run. Thank you for your support!

## Contributors & Credits

Thanks to all project contributors!

[![GitHub Contributors Image](https://contrib.rocks/image?repo=Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)

See the detailed list on [our site](https://ryan-millard.github.io/Img2Num/credits) or on [GitHub](https://github.com/Ryan-Millard/Img2Num/graphs/contributors).
