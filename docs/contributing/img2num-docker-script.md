# Img2Num Docker Script

URL: https://img2num.dev/docs/contributing/img2num-docker-script

The `img2num` script is the recommended way to interact with the Docker development environment. It automatically manages the development container for you.

Automatic image selection
You normally **don't need to specify a Docker image** . The script automatically:
1. Reuses the last image you used.
2. Falls back to the default development image if none has been selected.
The image selection flags below are only useful if you want to override this behaviour (see Selecting a Docker image ).

## Common commands

### Open a shell

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```bash
./img2num sh
```

Paste this in your terminal

```bat
.\img2num.bat sh
```

Paste this in your terminal

```powershell
.\img2num.ps1 sh
```

Starts (if necessary) and opens an interactive Bash shell inside the Docker development container.

### Run a command

- Linux / macOS - Windows CMD - PowerShell
Paste this in your terminal

```bash
./img2num run <command>
```

Paste this in your terminal

```bat
.\img2num.bat run <command>
```

Paste this in your terminal

```powershell
.\img2num.ps1 run <command>
```

Runs a one-off command inside the Docker development container.

Example:

```bash
./img2num run just build docs
```

> `run` and `exec` are interchangeable.

### Stop the container

- Linux / macOS - Windows CMD - PowerShell

```bash
./img2num stop
```

```bat
.\img2num.bat stop
```

```powershell
.\img2num.ps1 stop
```

Stops the running development container while preserving its data.

## Selecting a Docker image

Most users can ignore this section.

If you need to use a different development image, you can override the automatically selected image for a single command.

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

- Linux / macOS - Windows CMD - PowerShell

```bash
./img2num help
```

```bat
.\img2num.bat help
```

```powershell
.\img2num.ps1 help
```
