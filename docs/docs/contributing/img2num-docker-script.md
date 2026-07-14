---
id: img2num-docker-script
title: Img2Num Docker Script
sidebar_label: Docker Script
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

The `img2num` script is the recommended way to interact with the Docker development
environment. It automatically manages the development container for you.

:::tip[Automatic image selection]

You normally **don't need to specify a Docker image**.

The script automatically:

1. Reuses the last image you used.
2. Falls back to the default development image if none has been selected.

The image selection flags below are only useful if you want to override this behaviour
(see [Selecting a Docker image](#selecting-a-docker-image)).

:::

## Common commands

### Open a shell

<Tabs
defaultValue="bash"
values={[
  { label: "Linux / macOS", value: "bash" },
  { label: "Windows CMD", value: "cmd" },
  { label: "PowerShell", value: "powershell" },
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

```powershell title="Paste this in your terminal"
.\img2num.ps1 sh
```

</TabItem>

</Tabs>

Starts (if necessary) and opens an interactive Bash shell inside the Docker development container.

### Run a command

<Tabs
defaultValue="bash"
values={[
  { label: "Linux / macOS", value: "bash" },
  { label: "Windows CMD", value: "cmd" },
  { label: "PowerShell", value: "powershell" },
]}>

<TabItem value="bash">

```bash title="Paste this in your terminal"
./img2num run <command>
```

</TabItem>

<TabItem value="cmd">

```bat title="Paste this in your terminal"
.\img2num.bat run <command>
```

</TabItem>

<TabItem value="powershell">

```powershell title="Paste this in your terminal"
.\img2num.ps1 run <command>
```

</TabItem>

</Tabs>

Runs a one-off command inside the Docker development container.

Example:

```bash
./img2num run just build docs
```

> `run` and `exec` are interchangeable.

### Stop the container

<Tabs
defaultValue="bash"
values={[
  { label: "Linux / macOS", value: "bash" },
  { label: "Windows CMD", value: "cmd" },
  { label: "PowerShell", value: "powershell" },
]}>

<TabItem value="bash">

```bash
./img2num stop
```

</TabItem>

<TabItem value="cmd">

```bat
.\img2num.bat stop
```

</TabItem>

<TabItem value="powershell">

```powershell
.\img2num.ps1 stop
```

</TabItem>

</Tabs>

Stops the running development container while preserving its data.

## Selecting a Docker image

Most users can ignore this section.

If you need to use a different development image, you can override the automatically
selected image for a single command.

### `--img`

Use a specific Docker image.

```bash
./img2num sh --img ghcr.io/ryan-millard/img2num-dev:latest
```

### `--dh-img`

Shorthand for Docker Hub images.

```bash
./img2num sh --dh-img dev
```

Equivalent to:

```bash
./img2num sh --img ryanmillard/img2num-dev:dev
```

### `--ghcr-img`

Shorthand for GitHub Container Registry images.

```bash
./img2num sh --ghcr-img latest
```

Equivalent to:

```bash
./img2num sh --img ghcr.io/ryan-millard/img2num-dev:latest
```

## More commands

The script also supports commands such as:

- `restart`
- `down`
- `purge`
- `destroy`
- `logs`
- `last-image`

For the complete command reference, run:

<Tabs
defaultValue="bash"
values={[
  { label: "Linux / macOS", value: "bash" },
  { label: "Windows CMD", value: "cmd" },
  { label: "PowerShell", value: "powershell" },
]}>

<TabItem value="bash">

```bash
./img2num help
```

</TabItem>

<TabItem value="cmd">

```bat
.\img2num.bat help
```

</TabItem>

<TabItem value="powershell">

```powershell
.\img2num.ps1 help
```

</TabItem>

</Tabs>
