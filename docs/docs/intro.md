---
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import hedgeSleep from '@site/static/img/pixel_art_hedgehog/sleep/sleep.gif';

# Intro

Welcome to **Img2Num**!

<img src={hedgeSleep} style={{ display: 'block', margin: '0 auto', height: '20vh', aspectRatio: 'maintain' }}/>

This page will help you get the app up and running as well as direct you to any documentation you may need in the future.

## Getting Started

This section covers how to run the application for the first time - from installation to first run.

### What you'll need

- [Node.js](https://nodejs.org/en/download/) version 20.0 or above:
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
 - [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
  - `emcc` must be in your path.
  - This is used to compile the C++ to WebAssembly.
 - [Make](https://www.gnu.org/software/make/) or compatible build system
 - [Vite](https://vitejs.dev/) (installed via npm install)

:::warning

If `emcc` or `make` is not visible in your terminal, that means that they haven't been added to your `PATH` and that Img2Num cannot build or run the app.

<Tabs groupId="operating-systems" queryString>
  <TabItem value="windows" label="Windows" default>
    For `Windows`, [this link](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) will explain how to add variables to your `PATH`.
  </TabItem>
  <TabItem value="macos" label="macOS" default>
    For `macOS`, [this link](https://stackoverflow.com/questions/22465332/setting-path-environment-variable-in-macos-permanently) will explain how to add variables to your `PATH`.
  </TabItem>
  <TabItem value="linux" label="Linux" default>
    For `Linux`, [this link](https://unix.stackexchange.com/questions/26047/how-to-correctly-add-a-path-to-path) will explain how to add variables to your `PATH`.

    Alternatively, you can also use an alias and source it only when you need it. This can be faster but requires you to remember to type a command every time you need emscripten.

    ```bash title="This goes in your ~/.bashrc file"
    alias emsdk-activate="source <path-to-emscripten>/installation/emsdk/emsdk_env.sh"
    ```
    ```bash title="Run this every time you need to use emscripten"
    emsdk-activate
    ```
  </TabItem>
</Tabs>

:::

### Cloning the repository

```bash title="Clone the repository into a folder named Img2Num"
# Clone the repository into a folder named `Img2Num`
git clone https://github.com/Ryan-Millard/Img2Num.git
```

### Installing dependencies

This section will help you install all the required dependencies.

You can choose to only install the dependencies for one, but it is recommended that you install the dependencies for both.

<Tabs>
  <TabItem value="both" label="Both" default>
    ```bash title="Install all dependendencies"
    # Install main app's dependencies
    cd Img2Num
    npm install

    # Install documentation site's dependencies
    npm install --prefix ./docs
    ```
  </TabItem>
  <TabItem value="main-app-only" label="Main App Only">
    ```bash title="Install only the main app's dependencies"
    cd Img2Num
    npm install
    ```
  </TabItem>
  <TabItem value="documentation-site-only" label="Docs Site Only" default>
    ```bash title="Install only the documentation site's dependencies"
    npm install --prefix ./docs
    ```
  </TabItem>
</Tabs>

## Running the app for the first time

This section will help you run both the main application and the documentation site for the first time.

<Tabs>
  <TabItem value="running-both-simultaneously" label="Running Both Simultaneously" default>
    From the project's root, run:

    ```bash title="Concurrently run both the Vite development and Docs servers"
    npm run dev:all
    ```
  </TabItem>
  <TabItem value="running-main-app-only" label="Running Main App Only">
    From the project's root, run:

    ```bash title="Run the Vite development server"
    npm run dev
    ```
  </TabItem>
  <TabItem value="running-documentation-site-only" label="Running Docs Site Only" default>
    From the `docs/` folder, run:

    ```bash title="Run the Docs server"
    npm run start
    ```

    <div style={{ textAlign: 'center' }}>**OR**</div>

    From the project's root, run:
    ```bash
    npm run docs start
    ```
  </TabItem>
</Tabs>
