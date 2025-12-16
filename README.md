<!--TODO: Remove the section below after #93 is merged on 22 Dec 2025-->
> [!CAUTION]
> ⚠️⚠️⚠️ **Breaking Change in [PR #93](https://github.com/Ryan-Millard/Img2Num/pull/93)** ⚠️⚠️⚠️
> 
> The Makefile behavior is changing soon.
>
> Please read [PR #107](https://github.com/Ryan-Millard/Img2Num/pull/107) before running the code.

---

# Img2Num 🖼️➞️🎨

**Img2Num** is a React + WebAssembly-based application that allows users to upload an image and convert it into a **colour-by-number** version that can be either printed or coloured in directly within the browser. It's designed to be fast, efficient, and interactive, leveraging C++ (compiled to WebAssembly) for pixel manipulation.

<table align="center">
  <tr>
    <!-- Top: Big Mountains image -->
    <td align="center" colspan="3">
      <img src="docs/static/img/readme-demo/aerial-view-mountains_colored_pexels-pixabay-51373.jpg" width="400" alt="Mountains Final"><br>
      Mountains<br>
      <img src="docs/static/img/readme-demo/aerial-view-mountains_pexels-pixabay-51373.jpg" width="150" alt="Mountains Original">
      <img src="docs/static/img/readme-demo/aerial-view-mountains_processed_pexels-pixabay-51373.jpg" width="150" alt="Mountains Template"><br>
      Original + Template
    </td>
  </tr>
  <tr>
    <!-- Bottom: three smaller images -->
    <td align="center">
      <img src="docs/static/img/readme-demo/girl-in-nature_colored_pexels-emmypaw-5461675.jpg" width="250" alt="Girl Final"><br>
      Girl in Nature<br>
      <img src="docs/static/img/readme-demo/girl-in-nature_pexels-emmypaw-5461675.jpg" width="100" alt="Girl Original">
      <img src="docs/static/img/readme-demo/girl-in-nature_processed_pexels-emmypaw-5461675.jpg" width="100" alt="Girl Template"><br>
      Original + Template
    </td>
    <td align="center">
      <img src="docs/static/img/readme-demo/people_colored_pexels-rdne-6224636.jpg" width="250" alt="People Final"><br>
      People<br>
      <img src="docs/static/img/readme-demo/people_pexels-rdne-6224636.jpg" width="100" alt="People Original">
      <img src="docs/static/img/readme-demo/people_processed_pexels-rdne-6224636.jpg" width="100" alt="People Template"><br>
      Original + Template
    </td>
    <td align="center">
      <img src="docs/static/img/readme-demo/rio-de-janeiro_colored_pexels-athena-6580703.jpg" width="250" alt="Rio Final"><br>
      Rio de Janeiro<br>
      <img src="docs/static/img/readme-demo/rio-de-janeiro_pexels-athena-6580703.jpg" width="100" alt="Rio Original">
      <img src="docs/static/img/readme-demo/rio-de-janeiro_processed_pexels-athena-6580703.jpg" width="100" alt="Rio Template"><br>
      Original + Template
    </td>
  </tr>
</table>


## Goal

> To make a fast, offline, serverless application that runs at near-native speeds, enabling in-browser colouring or printing of the image.

---

## ✨ Features

- Upload an image (e.g. PNG, JPG)
- Convert it into a colour-by-number version
- Preview the simplified image directly in the browser
- Print-friendly output for physical colouring
- In-browser colouring support
- Fast image processing using WebAssembly and C++

---

## 🧠 How It Works

1. The user uploads an image.
2. The image is processed into raw pixel data in JavaScript.
3. That data is passed to WebAssembly (C++) for transformation.
4. The output is a simplified, indexed version of the image.
5. A **K-Means Clustering** algorithm is used to reduce colours to a small, distinct palette.
6. The output is rendered on a `<canvas>` and optionally made printable.

---

## 🎞️ Tech Stack

| Layer          | Tooling                      |
| -------------- | ---------------------------- |
| Frontend       | React 19                     |
| Image Handling | HTML Canvas, JavaScript      |
| WASM           | C++ compiled with Emscripten |
| Build Tool     | Vite 7                       |
| Styling        | CSS (basic)                  |
| Linting        | ESLint                       |
| Scripting      | Makefile for WASM builds     |

---

## 🛠️ Development

### 🧱 Prerequisites

Make sure the following tools are installed on your system:

- [Node.js](https://nodejs.org/) (includes `npm`)
- [Vite](https://vitejs.dev/)
  _(Installed automatically via `npm install`, but you can install globally with `npm install -g vite` for convenience)_
- [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
  _(Ensure `emcc` is available in your `PATH`)_
- [Make](https://www.gnu.org/software/make/) or compatible build system

### 📅 Installation

```bash
git clone https://github.com/yourusername/img2num.git
cd img2num
npm install
```

### 🚀 Run the App

```bash
npm run dev
```

> This builds the WASM modules and starts the Vite dev server.

### 🔪 Debug Mode

```bash
npm run dev:debug
```

---

## 🔧 Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Build WASM & start dev server       |
| `npm run build`    | Build WASM & production bundle      |
| `npm run clean`    | Remove WASM builds and Vite `dist/` |
| `npm run lint`     | Run linter                          |
| `npm run lint:fix` | Auto-fix lint issues                |
| `npm run help`     | Show available `make` commands      |

---

## 📂 Project Structure

```
src/
├── App.jsx               # Main React component
├── utils/
│   └── image-utils.js    # JS utilities for image handling
├── wasm/
│   ├── src/              # C++ source code
│   ├── include/          # C++ headers
│   └── build/            # WASM output files
```

---

## 🔮 Algorithm Plan: K-Means Clustering

We plan to use K-Means Clustering to reduce the number of unique colours in the uploaded image to a more manageable, user-defined number (e.g., 4–12 colours). These clustered colours will be used as the numbered colour palette for the final output.

---

## 🖨️ Print Mode (Planned)

We're planning to add a clean, print-friendly version of the colour-by-number output so that users can:

- Print the image
- View the legend with colour numbers
- Colour it in manually

---

## 📋 License

[GNU Affero General Public License v3.0](https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE)

---

## 👥 Authors

- Ryan Millard
- Hayden Millard

---

## 🙌 Contributions

Pull requests and issues are welcome! If you have a feature request or bug to report, feel free to open an issue.
