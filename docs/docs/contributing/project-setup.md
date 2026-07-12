---
id: project-setup
title: Setup
sidebar_label: Project Setup
sidebar_position: 2
toc_max_heading_level: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

:::tip[Just want to _use_ the library?]

If you only want to use Img2Num (e.g. via [npm](https://www.npmjs.com/package/img2num)),
see the relevant documentation from the links below instead.

> This page explains how to build the project for development.

<div style={{ display: "flex", justifyContent: "space-evenly", maxWidth: "500px", margin: "0 auto" }}>

[<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" width="30" alt="C" />](../../c)

[<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" width="30" alt="C++" />](../../cpp)

[<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="30" alt="JavaScript" />](../../js)

[<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="30" alt="Python" />](../../py)

</div>

:::

## 0. Before you begin

:::tip[Planning to contribute?]

If you intend to contribute to Img2Num, **fork the repository first** and clone
your fork instead of the main repository.

If you're only experimenting with the codebase or building the project locally,
you can clone the main repository directly.

The complete contribution workflow is explained in the
[Pull Requests](../pull-requests) guide.

:::

<details open>
<summary>

### 0.1. Prerequisites

</summary>

- [Git](https://git-scm.com/downloads)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended) or [Docker Engine](https://docs.docker.com/engine/install/)

**Verify Prerequisite Installations**:

```bash title="Paste this in your terminal"
git --version
docker --version
```

:::note[Docker]

We recommend using our prebuilt Docker dev environment.
Setting up the environment locally adds unnecessary complexity, so we recommend against it.

_If you choose to develop locally, you are responsible for configuring and maintaining your own environment._

:::

</details>

<details>
<summary>

### 0.2. Quick Start

</summary>

This section will help you get started quickly so you don't have to read everything below.

#### Clone and setup

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">

```sh title="Paste this in your terminal"
# Clone the repository
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/

# Open Docker container
./img2num sh

# Initialize and build the project
just init
```

</TabItem>
<TabItem value="cmd">

```sh title="Paste this in your terminal"
# Clone the repository
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/

# Open Docker container
.\img2num.bat sh

# Initialize and build the project
just init
```

</TabItem>
<TabItem value="powershell">

```sh title="Paste this in your terminal"
# Clone the repository
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/

# Open Docker container
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\img2num.ps1 sh

# Initialize and build the project
just init
```

</TabItem>
</Tabs>

#### Test that everything works

See [Test that everything works](#4-test-that-everything-works) below.

#### See the other documentation

We recommend that you read the documentation below as well as the [Docker Script](../img2num-docker-script)
and [Just](../just) pages to understand how the development environment works.

</details>

## 1. Clone the repository

```bash title="Paste this in your terminal"
git clone https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num/
```

:::danger[Don't recurse submodules]

Recursing all Git submodules (especially Dawn's) can be very slow and takes up a lot of space.
We don't recommend worrying about them at this stage - [Step 3](./#3-initialise-and-build-everything) will handle it for you.

The `--recursive` flag pulls the required submodules. If you forgot it, `just init`
(below) will pull them for you.

:::

## 2. Start the dev container

The command below opens the Docker development container's Bash shell.
The `img2num` script manages the container.

<Tabs
defaultValue="bash"
values={[
{ label: 'Linux / macOS', value: 'bash' },
{ label: 'Windows CMD', value: 'cmd' },
{ label: 'PowerShell', value: 'powershell' },
]}>
<TabItem value="bash">

```bash title="Paste this in your terminal"
./img2num sh
```

</TabItem>
<TabItem value="cmd">

```bat title="Paste this in your terminal"
.\img2num.bat sh
```

</TabItem>
<TabItem value="powershell">

:::note[Windows blocks PowerShell]

```powershell title="Run once to allow locally created scripts to execute"
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

After that, `.\img2num.ps1` will work normally.

This only needs to be done once and allows locally created PowerShell scripts (like
`img2num.ps1`) to run without prompting again.

:::

```powershell title="Paste this in your terminal"
.\img2num.ps1 sh
```

</TabItem>
</Tabs>

> See [Img2Num Docker Script](../img2num-docker-script) for more information about this.

## 3. Initialise and build everything

Img2Num uses [Just](https://github.com/casey/just) to make it
easier to manage the repository. It allows us to consolidate our scripting with a single tool.

The purpose of the command below is to give you a clean, working checkout. You won't need to use it again.

```bash title="Paste this in the Docker shell"
just init
```

As mentioned in [Step 1](./#1-clone-the-repository) `just init`:
1. **Installs dependencies** (shallow Git submodule pull, `pnpm install`, etc.)
2. Compiles all code (C++, C, JavaScript, Python package, etc.) via `just build all`.

See [Img2Num's Just documentation](../just) for more information.

## 4. Test that everything works

:::important[Input Image]

Ensure that you have an image to test with.

We recommend using a small image to do the testing because they are fast to process.

Picsum Photos offers some nice random images:

- [128x128px](https://picsum.photos/128)
- [256x256px](https://picsum.photos/256)

:::


To test that you have built everything properly, we recommend running `just build all` from above
and testing each example app. You can find out how to use the example app on our
[Just documentation page](../just/#example-applications).

---

## DONE!

Congrats! You're now good to go.

:::note[Next Steps]

You'll probably want to check out one of these sections next, though:

- Building the project
- Cleaning the project
- What to do when you forget a command

:::
