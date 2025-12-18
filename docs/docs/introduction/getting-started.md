---
id: getting-started
title: 🚀 Getting Started
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Getting Started

This section covers how to run the application for the first time - from installation to first run.

### Requirements

Before you start installing anything, make sure you have the below installed

- [Git](https://git-scm.com/install/)
  - Used to download the code and make contributions.
- [Node.js](https://nodejs.org/en/download/) version 20.0 or higher
  - When installing Node.js, you are recommended to check all checkboxes related to dependencies.
- [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) version 4.0.10 or higher
  - This is used to compile the C++ to WebAssembly.
- [CMake](https://www.gnu.org/software/make/)
  - The build system for C++.
- [Python](https://www.python.org/downloads/) version 3.8 or higher
  - Emscripten requires this for its tooling and scripts.

:::warning

These all need to be set in your PATH variable and must be accessible in your terminal for Img2Num to run properly.

<details>
  <summary>How to check for and set PATH variables</summary>
  <Tabs groupId="operating-systems" queryString>
    <TabItem value="windows" label="Windows" default>
      #### Check if a tool is in your path
      Open `Command Prompt` or `Powershell` by pressing the `windows button` + `cmd`/`powershell`, then run:
      ```cmd
      git --version
      node --version
      python --version
      cmake --version
      emcc -v
      ```
      If the command prints a version, it’s already in PATH. If it says “command not found” or similar, you need to add it.

      #### Not in your path?
      For `Windows`, [this link](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) will explain how to add variables to your `PATH`.
    </TabItem>
    <TabItem value="macos" label="macOS" default>
      #### Check if a tool is in your path
      Open `Terminal`, then run:
      ```bash
      git --version
      node --version
      python --version
      cmake --version
      emcc -v
      ```
      If the command prints a version, it’s already in PATH. If it says “command not found” or similar, you need to add it.

      #### Not in your path?
      For `macOS`, [this link](https://stackoverflow.com/questions/22465332/setting-path-environment-variable-in-macos-permanently) will explain how to add variables to your `PATH`.
    </TabItem>
    <TabItem value="linux" label="Linux" default>
      #### Check if a tool is in your path
      Open `Terminal`, then run:
      ```bash
      git --version
      node --version
      python --version
      cmake --version
      emcc -v
      ```
      If the command prints a version, it’s already in PATH. If it says “command not found” or similar, you need to add it.

      #### Not in your path?
      For `Linux`, [this link](https://unix.stackexchange.com/questions/26047/how-to-correctly-add-a-path-to-path) will explain how to add variables to your `PATH`.
    </TabItem>

  </Tabs>
</details>

:::

### Cloning the repository

This step will guide you through downloading (cloning) the repository's code into a folder, named `Img2Num`.

```bash title="Clone the repository into a folder named Img2Num"
# Clone the repository into a folder named `Img2Num`
git clone https://github.com/Ryan-Millard/Img2Num.git
```

### Installing dependencies

This section will help you install all the required dependencies.

You can choose to only install the dependencies for one portion of the app, but it is recommended that you install the dependencies for both if you want all the functionality.

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

### Further Information
You may want to have a look at the [Project Scripts section](../project-scripts/overview) now, but make sure that you understand and
agree with Img2Num's [License](../license) and [guidelines](../category/-guidelines) first.
