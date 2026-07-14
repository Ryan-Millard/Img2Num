# Setup

URL: https://img2num.dev/docs/contributing/project-setup

Just want to *use* the library?
If you only want to use Img2Num (e.g. via [npm](https://www.npmjs.com/package/img2num) ), see the relevant documentation from the links below instead.
> This page explains how to build the project for development.

![C](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg) ![C++](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg) ![JavaScript](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg) ![Python](https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg)

## 0. Before you begin

Planning to contribute?
If you intend to contribute to Img2Num, **fork the repository first** and clone your fork instead of the main repository. If you're only experimenting with the codebase or building the project locally, you can clone the main repository directly. The complete contribution workflow is explained in thePull Requests guide.

### 0.1. Prerequisites

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or [Docker Engine](https://docs.docker.com/engine/install/)
**Verify Prerequisite Installations** : Paste this in your terminal

```bash
git --version
docker --version
```

Docker
We recommend using our prebuilt Docker dev environment. Setting up the environment locally adds unnecessary complexity, so we recommend against it. *If you choose to develop locally, you are responsible for configuring and maintaining your own environment.*

### 0.2. Quick Start

This section will help you get started quickly so you don't have to read everything below.
#### Clone and setup

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```sh
# Clone the repository
git clone https://github.com/<your-username>/Img2Num.git
cd Img2Num/

# Open Docker container
./img2num sh

# Initialize and build the project
just init
```

Paste this in your terminal

```sh
# Clone the repository
git clone https://github.com/<your-username>/Img2Num.git
cd Img2Num/

# Open Docker container
.\img2num.bat sh

# Initialize and build the project
just init
```

Paste this in your terminal

```sh
# Clone the repository
git clone https://github.com/<your-username>/Img2Num.git
cd Img2Num/

# Open Docker container
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\img2num.ps1 sh

# Initialize and build the project
just init
```

#### Test that everything works

See Test that everything works below.
#### See the other documentation

We recommend that you read the documentation below as well as theDocker Script andJust pages to understand how the development environment works.

## 1. Clone the repository

Paste this in your terminal

```bash
git clone https://github.com/<your-username>/Img2Num.git
cd Img2Num/
```

Don't recurse submodules
Recursing all Git submodules (especially Dawn's) can be very slow and takes up a lot of space. We don't recommend worrying about them at this stage - [Step 3](/docs/contributing/project-setup/#3-initialise-and-build-everything) will handle it for you. `just init` (in [Step 3](/docs/contributing/project-setup/#3-initialise-and-build-everything) ) will pull and manage the submodules automatically for you.

## 2. Start the dev container

The command below opens the Docker development container's Bash shell. The `img2num` script manages the container.

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```bash
./img2num sh
```

Paste this in your terminal

```bat
.\img2num.bat sh
```

Windows blocks PowerShell
Run once to allow locally created scripts to execute

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

After that, `.\img2num.ps1` will work normally. This only needs to be done once and allows locally created PowerShell scripts (like `img2num.ps1` ) to run without prompting again.

Paste this in your terminal

```powershell
.\img2num.ps1 sh
```

> See theImg2Num Docker Script page for more information about this.

## 3. Initialise and build everything

Img2Num uses [Just](https://github.com/casey/just) to make it easier to manage the repository. It allows us to consolidate our scripting with a single tool.

The purpose of the command below is to give you a clean, working checkout. You won't need to use it again.

Paste this in the Docker shell

```bash
just init
```

As mentioned in [Step 1](/docs/contributing/project-setup/#1-clone-the-repository)`just init` :

1. **Installs dependencies** (shallow Git submodule pull, `pnpm install` , etc.)
2. Compiles all code (C++, C, JavaScript, Python package, etc.) via `just build all` .
SeeImg2Num's Just documentation page for more information.

## 4. Test that everything works

Input Image
Ensure that you have an image to test with. We recommend using a small image to do the testing because they are fast to process. Picsum Photos offers some nice random images:
- [128x128px](https://picsum.photos/128)
- [256x256px](https://picsum.photos/256)

To test that you have built everything properly, we recommend running `just build all` from above and testing each example app. You can find out how to use the example app on [our Just documentation](/docs/contributing/just/#example-applications) page.

## DONE!

Congrats! You're now good to go.

Next Steps
You'll probably want to check out one of these sections next, though:
- Building the project
- Cleaning the project
- What to do when you forget a command
