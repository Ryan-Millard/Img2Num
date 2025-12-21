---
id: getting-started
title: 🚀 Getting Started
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import DockerHomepage  from './img/docker-desktop-homepage.jpg';
import DockerSettings  from './img/docker-desktop-settings-button-location.jpg';
import DockerWslSetup  from './img/docker-desktop-wsl-integration-setup.jpg';
import DockerResources from './img/docker-desktop-resources-button-location.jpg';
import DockerWslButton from './img/docker-desktop-wsl-integration-button-location.jpg';

## Getting Started

This section covers how to run the application for the first time - from installation to first run.

### Requirements

:::tip
We highly recommend that you consider both options below (the Docker route and the local route) in case
you run into problems at a later stage.

The Docker route is the fastest and easiest to set up,
so you should definitely start with that!
:::

Before you start installing anything, make sure you have the below installed.

- [Git](https://git-scm.com/install/): Used to download the code and make contributions.

<Tabs groupId="installation-route" defaultValue="docker">
<TabItem value="docker" label="Docker (Recommended)" default>
#### Installing Docker

The section below will guide you through installing Docker on your operating system.

<Tabs groupId="docker-install-windows" defaultValue="windows">

  <TabItem value="windows" label="Windows (Recommended)" default>
    1. Install a **POSIX environment**
        <Tabs groupId="docker-install" defaultValue="wsl">
          <TabItem value="wsl" label="WSL (Recommended)" default>
            :::important We **highly recommend using WSL2**.
            While Docker Desktop can run without it,
            WSL2 gives a much smoother experience and works best with the POSIX-oriented scripts in Img2Num.
            WSL, in general, is much faster than Hyper-V is with Docker.
            :::

            ```powershell title="Run This in Powershell"
            wsl --install
            ```
            This will install Ubuntu by default. You can use other distributions if you prefer.
            See [Microsoft's documentation](https://learn.microsoft.com/en-us/windows/wsl/install) to 
            find out more about installing WSL.
          </TabItem>
          <TabItem value="git-bash" label="Git Bash">
            If you don't have WSL (or a POSIX shell),
            it is recommended that you at least download [**Git Bash**](https://git-scm.com/install/windows)
            or another POSIX shell. WSL is still faster, so you should consider installing it.

            This is because **Img2Num's code is best suited for POSIX shells**. We have tried our
            best to support other shells, but there is a chance that you will run into
            problems if you don't use a POSIX shell because most of our developers use POSIX shells.
          </TabItem>
          <TabItem value="cmd-or-powershell" label="CMD / Powershell">
            If you are using CMD or PowerShell, you can still run the same Docker commands (although they will be slower),
            but **POSIX shells like WSL/Git Bash are recommended** for the best compatibility with Img2Num scripts.
          </TabItem>
        </Tabs>

    2. Download and install **Docker Desktop** from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).
        <Tabs groupId="docker-install" defaultValue="wsl">
          <TabItem value="wsl" label="WSL (Recommended)" default>
            During installation, make sure:
            - "Use WSL2 instead of Hyper-V" is selected.
            - Your preferred Linux distribution (e.g., Ubuntu) is enabled.
          </TabItem>
          <TabItem value="git-bash" label="Git Bash">
            During installation, make sure:
            - "Use Hyper-V of WSL2 instead" is selected.

            After installation, do the following:
            1. Open Docker Desktop.
              <img src={DockerHomepage} alt="Docker Desktop Homepage" style={{ maxWidth: '100%' }} />
            2. Click "Settings" in the top right of the screen.
              <img src={DockerSettings} alt="Docker Settings Button Location" style={{ maxWidth: '100%' }} />
            3. Click "Resources" in the sidebar.
              <img src={DockerWslSetup} alt="Docker WSL Integration Setup" style={{ maxWidth: '100%' }} />
            4. Select "WSL Integration".
              <img src={DockerResources} alt="Docker Resources Button Location" style={{ maxWidth: '100%' }} />
            5. Select "Enable integration with my default WSL distro" and select the other distributions you want to enable Docker for.
              <img src={DockerWslButton} alt="Docker WSL Integration Button Location" style={{ maxWidth: '100%' }} />
          </TabItem>
          <TabItem value="cmd-or-powershell" label="CMD / Powershell">
            During installation, make sure:
            - "Use Hyper-V of WSL2 instead" is selected.

            After installation, do the following:
            1. Open Docker Desktop.
              <img src={DockerHomepage} alt="Docker Desktop Homepage" style={{ maxWidth: '100%' }} />
            2. Click "Settings" in the top right of the screen.
              <img src={DockerSettings} alt="Docker Settings Button Location" style={{ maxWidth: '100%' }} />
            3. Click "Resources" in the sidebar.
              <img src={DockerWslSetup} alt="Docker WSL Integration Setup" style={{ maxWidth: '100%' }} />
            4. Select "WSL Integration".
              <img src={DockerResources} alt="Docker Resources Button Location" style={{ maxWidth: '100%' }} />
            5. Select "Enable integration with my default WSL distro" and select the other distributions you want to enable Docker for.
              <img src={DockerWslButton} alt="Docker WSL Integration Button Location" style={{ maxWidth: '100%' }} />
          </TabItem>
        </Tabs>

    3. Verify the installation in your **WSL terminal or Git Bash**:
       ```bash
       docker --version
       docker compose version
       ```

    :::danger Docker not working?
    Make sure to keep Docker Desktop open while you're using Docker because it needs to be open to run containers.
    :::
  </TabItem>

  <TabItem value="macos" label="macOS">

  ### Installing Docker on macOS

  1. Download and install **Docker Desktop** from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

  2. Open Docker Desktop and ensure it is running.

  3. Verify installation in Terminal:
     ```bash
     docker --version
     docker compose version
     ```

  </TabItem>

  <TabItem value="linux" label="Linux">

  ### Installing Docker on Linux

  1. Install Docker and Docker Compose via your package manager. For Ubuntu/Debian:
     ```bash
     sudo apt update
     sudo apt install -y docker.io docker-compose
     sudo systemctl enable --now docker
     sudo usermod -aG docker $USER
     ```
     > You may need to log out and back in for the group change to take effect.

  2. Verify installation:
     ```bash
     docker --version
     docker compose version
     ```

  </TabItem>

</Tabs>

</TabItem>

<TabItem value="local" label="Local / Manual Setup">
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

</TabItem>
</Tabs>

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
  <TabItem value="both-concurrently" label="Both Concurrently" default>
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        :::caution Your Current Working Directory Matters!
        In order to call the `img2num` script that we will be using for Docker in the following sections,
        you need to stay in the root directory of the project since that is where the file is.
        :::
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            ```bash title="Install all dependencies"
            cd Img2Num
            chmod +x ./img2num
            ./img2num npm install

            ./img2num npm install --prefix ./docs
            ```
          </TabItem>

          <TabItem value="batch" label="Batch (Windows CMD)">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.bat npm install

            .\img2num.bat npm install --prefix ./docs
            ```
          </TabItem>

          <TabItem value="powershell" label="PowerShell">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.ps1 npm install

            .\img2num.ps1 npm install --prefix ./docs
            ```
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
        ```bash title="Install all dependencies"
        # Install main app's dependencies
        cd Img2Num
        npm install

        # Install documentation site's dependencies
        npm install --prefix ./docs
        ```
      </TabItem>
    </Tabs>

  </TabItem>
  <TabItem value="main-app-only" label="Main App Only">
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            ```bash title="Install all dependencies"
            cd Img2Num
            chmod +x ./img2num
            ./img2num npm install
            ```
          </TabItem>

          <TabItem value="batch" label="Batch (Windows CMD)">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.bat npm install
            ```
          </TabItem>

          <TabItem value="powershell" label="PowerShell">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.ps1 npm install
            ```
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
        ```bash title="Install only the main app's dependencies"
        cd Img2Num
        npm install
        ```
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="documentation-site-only" label="Docs Site Only" default>
  <TabItem value="both" label="Both" default>
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            ```bash title="Install all dependencies"
            cd Img2Num
            chmod +x ./img2num
            ./img2num npm install --prefix ./docs
            ```
          </TabItem>

          <TabItem value="batch" label="Batch (Windows CMD)">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.bat npm install --prefix ./docs
            ```
          </TabItem>

          <TabItem value="powershell" label="PowerShell">
            ```bash title="Install all dependencies"
            cd Img2Num
            .\img2num.ps1 npm install --prefix ./docs
            ```
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
      ```bash title="Install only the documentation site's dependencies"
      cd Img2Num
      npm install --prefix ./docs
      ```
      </TabItem>
    </Tabs>

  </TabItem>
  </TabItem>
</Tabs>

## Running the app for the first time

This section will help you run both the main application and the documentation site for the first time.

<Tabs>
  <TabItem value="both-concurrently" label="Both Concurrently" default>
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            From the project's root, run:
            ```bash title="Concurrently run both the Vite development and Docs servers"
            ./img2num dev:all
            ```

            :::tip
            You can always run `./img2num -h` or `./img2num --help` to see a full list of available commands and scripts.

            It is a wrapper script that allows you to use scripts defined in [`package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json)
            and [`docs/package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/package.json).
            :::
          </TabItem>
          <TabItem value="batch" label="Batch (Windows CMD)">
            From the project's root, run:
            ```bash title="Concurrently run both the Vite development and Docs servers"
            .\img2num.bat dev:all
            ```

            :::tip
            You can always run `.\img2num.bat -h` or `.\img2num.bat --help` to see a full list of available commands and scripts.

            It is a wrapper script that allows you to use scripts defined in [`package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json)
            and [`docs/package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/package.json).
            :::
          </TabItem>
          <TabItem value="powershell" label="PowerShell">
            From the project's root, run:
            ```bash title="Concurrently run both the Vite development and Docs servers"
            .\img2num.ps1 dev:all
            ```

            :::tip
            You can always run `.\img2num.ps1 -h` or `.\img2num.ps1 --help` to see a full list of available commands and scripts.

            It is a wrapper script that allows you to use scripts defined in [`package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/package.json)
            and [`docs/package.json`](https://github.com/Ryan-Millard/Img2Num/blob/main/docs/package.json).
            :::
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
        From the project's root, run:
        ```bash title="Concurrently run both the Vite development and Docs servers"
        npm run dev:all
        ```

        :::tip
        You can always run `npm run help` to see a full list of available commands and scripts which allows you to fuzzy find specific scripts.
        :::
      </TabItem>
    </Tabs>

  </TabItem>
  <TabItem value="main-app-only" label="Main App Only">
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            From the project's root, run:
            ```bash title="Run the Vite development server"
            ./img2num dev
            ```
          </TabItem>
          <TabItem value="batch" label="Batch (Windows CMD)">
            From the project's root, run:
            ```bash title="Run the Vite development server"
            .\img2num.bat dev
            ```
          </TabItem>
          <TabItem value="powershell" label="PowerShell">
            From the project's root, run:
            ```bash title="Run the Vite development server"
            .\img2num.ps1 dev
            ```
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
        From the project's root, run:
        ```bash title="Run the Vite development server"
        npm run dev
        ```
      </TabItem>
    </Tabs>
  </TabItem>
  <TabItem value="documentation-site-only" label="Docs Site Only" default>
    :::note
    The [documentation site](https://ryan-millard.github.io/Img2Num/info/) works like an isolated app.
    As a result, there are two options for each depending on where you are in the file system.
    :::
  <TabItem value="both" label="Both" default>
    <Tabs groupId="installation-route" defaultValue="docker">
      <TabItem value="docker" label="Docker (Recommended)" default>
        <Tabs groupId="setup-scripts" defaultValue="bash">
          <TabItem value="bash" label="Bash (Linux / macOS / WSL / Git Bash)" default>
            ```bash title="Run the Docs server"
            ./img2num docs start
            ```
          </TabItem>

          <TabItem value="batch" label="Batch (Windows CMD)">
            ```bash title="Run the Docs server"
            .\img2num.bat docs start
            ```
          </TabItem>

          <TabItem value="powershell" label="PowerShell">
            ```bash title="Run the Docs server"
            .\img2num.ps1 docs start
            ```
          </TabItem>
        </Tabs>
      </TabItem>
      <TabItem value="local" label="Local / Manual Setup">
        From the project's root:
        ```bash title="Run the Docs server"
        npm run docs start
        ```

        <div style={{ textAlign: 'center' }}>**OR**</div>

        From inside the `docs/` folder:
        ```bash title="Run the Docs server"
        npm run start
        ```
      </TabItem>
    </Tabs>

  </TabItem>
  </TabItem>
</Tabs>
