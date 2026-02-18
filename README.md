<div align="center">

<img src="https://github.com/user-attachments/assets/d75b402e-03af-403f-8637-f9eb8a24c8c0" alt="Logo" height="100px" />

# Img2Num

[![Deploy to GitHub Pages](https://github.com/Ryan-Millard/Img2Num/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ryan-Millard/Img2Num/actions/workflows/deploy.yml)

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

<div align="center">

### What are you waiting for?

Try it out now by [clicking here](https://ryan-millard.github.io/Img2Num/)!

</div>

---

## What this repository contains (short)

- A React frontend that handles image input, preview and in-browser colouring.
- A WebAssembly module (C++ → Emscripten) that performs image processing and colour quantisation.

This README is intentionally short — full installation steps, guides and references live in the docs site (see **Essential links** below).

## Essential links (docs site)

Visit the docs site for full guides, API references and troubleshooting:

- [Quick start](https://ryan-millard.github.io/Img2Num/info/docs/)
- [Documentation](https://ryan-millard.github.io/Img2Num/info/docs/)
- [Internal Documentation](https://ryan-millard.github.io/Img2Num/info/docs/internal/)
- [Changelog](https://ryan-millard.github.io/Img2Num/info/changelog)

## Contributing

See our [CONTIRBUTING.md](https://github.com/Ryan-Millard/Img2Num/blob/main/CONTRIBUTING.md)

## License Summary

- **MIT** — core packages, scripts, libraries, build tools, etc.
- **AGPLv3** — docs, example apps, CI/config.

See the top-level [LICENSE](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE) file for the explanation.

## Can't find something?

If you need something, you should be able to find it on the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/).
If it isn't there, please open a ["New Feature" issue](https://github.com/Ryan-Millard/Img2Num/issues/new?template=feature_request.yml) to request its addition to the [docs site](https://ryan-millard.github.io/Img2Num/info/docs/) and someone will assist you with finding what you need.

## Maintainers

- [<img src="https://github.com/Ryan-Millard.png" width="20" height="20" valign="middle" alt="Ryan-Millard avatar"> `@Ryan-Millard`](https://github.com/Ryan-Millard)
- [<img src="https://github.com/hjmillard.png" width="20" height="20" valign="middle" alt="hjmillard avatar"> `@hjmillard`](https://github.com/hjmillard)
- [<img src="https://github.com/krasner.png" width="20" height="20" valign="middle" alt="krasner avatar"> `@krasner`](https://github.com/krasner)

## Contributors & Credits

Thanks to all of our contributors - your impact on this project has been greatly appreciated!

[![GitHub Contributors Image](https://contrib.rocks/image?repo=Ryan-Millard/Img2Num)](https://github.com/Ryan-Millard/Img2Num/graphs/contributors)

See the detailed list on [our site](https://ryan-millard.github.io/Img2Num/credits).
