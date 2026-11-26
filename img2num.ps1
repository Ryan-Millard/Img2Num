#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
#
#   You may need to run: powershell -ExecutionPolicy Bypass -File .\img2num.ps1 ...
# ======================================================================

# ---------------------------------------------------------------------------
# Argument parsing — strip --img <value> and --gpu/--no-gpu from args before mode dispatch
# ---------------------------------------------------------------------------
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$AllArgs
)

$IMG2NUM_IMAGE_FLAG = ""
$IMG2NUM_IMAGE_SOURCE_SET = $false
$IMG2NUM_GPU_FLAG = ""
$FilteredArgs = [System.Collections.Generic.List[string]]::new()

if ($null -eq $AllArgs) { $AllArgs = @() }

for ($i = 0; $i -lt $AllArgs.Count; $i++) {
    $arg = $AllArgs[$i]
    # Everything after `--` is passed through untouched (e.g. `build -- --progress=plain`)
    if ($arg -eq "--") {
        $FilteredArgs.AddRange([string[]]$AllArgs[$i..($AllArgs.Count - 1)])
        break
    }
    if ($arg -eq "--gpu") {
        $IMG2NUM_GPU_FLAG = "1"
    } elseif ($arg -eq "--no-gpu") {
        $IMG2NUM_GPU_FLAG = "0"
    } elseif ($arg -in @("--img", "--dh-img", "--ghcr-img")) {
        if ($IMG2NUM_IMAGE_SOURCE_SET) {
            Write-Error "Error: Only one of --img, --dh-img, or --ghcr-img may be used."
            exit 1
        }
        $IMG2NUM_IMAGE_SOURCE_SET = $true
        $flag = $arg
        $i++
        if ($i -ge $AllArgs.Count -or $AllArgs[$i] -eq "") {
            Write-Error "Error: $flag requires a tag argument."
            exit 1
        }
        $val = $AllArgs[$i]
        if ($flag -in @("--dh-img", "--ghcr-img") -and $val -match ":") {
            Write-Error "Error: $flag expects a tag, not a full image (no ':'). Use --img instead."
            exit 1
        }
        switch ($flag) {
            "--img"      { $IMG2NUM_IMAGE_FLAG = $val }
            "--dh-img"   { $IMG2NUM_IMAGE_FLAG = "ryanmillard/img2num-dev:$val" }
            "--ghcr-img" { $IMG2NUM_IMAGE_FLAG = "ghcr.io/ryan-millard/img2num-dev:$val" }
        }
    } else {
        $FilteredArgs.Add($arg)
    }
}

$Mode = if ($FilteredArgs.Count -gt 0) { $val = $FilteredArgs[0]; $FilteredArgs.RemoveAt(0); $val } else { "" }
$RemainingArgs = $FilteredArgs.ToArray()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
$IMG2NUM_DEFAULT_IMAGE = "ryanmillard/img2num-dev:dev"
# No GPU image is published, so GPU mode defaults to the one built by `./img2num.ps1 build --gpu`.
$IMG2NUM_DEFAULT_GPU_IMAGE = "img2num-dev:gpu"
$IMG2NUM_STATE_FILE = Join-Path $PSScriptRoot ".img2num-state"

# ---------------------------------------------------------------------------
# State helpers
# ---------------------------------------------------------------------------

# Sets KEY=value in the state file, replacing an existing KEY= line or appending one.
function Set-StateValue {
    param(
        [string]$Key,
        [string]$Value
    )

    $lines = @()
    if (Test-Path $IMG2NUM_STATE_FILE) {
        $lines = @(Get-Content -Path $IMG2NUM_STATE_FILE)
    } else {
        $lines = @(
            "# This file is managed by the img2num scripts."
            "# Do not edit manually."
        )
    }

    $done = $false
    $newContent = @(
        foreach ($line in $lines) {
            if (-not $done -and $line.StartsWith("$Key=")) {
                $done = $true
                "$Key=$Value"
            } else {
                $line
            }
        }
    )
    if (-not $done) {
        $newContent += "$Key=$Value"
    }

    Set-Content -Path $IMG2NUM_STATE_FILE -Value $newContent -Encoding UTF8
}

# Returns the value of KEY= from the state file, or "" if it is missing.
function Get-StateValue {
    param([string]$Key)

    if (Test-Path $IMG2NUM_STATE_FILE) {
        foreach ($line in Get-Content -Path $IMG2NUM_STATE_FILE) {
            if ($line.StartsWith("$Key=")) {
                return $line.Substring($Key.Length + 1).Trim()
            }
        }
    }
    return ""
}

# Returns "1" if GPU access is enabled, else "0", in priority order:
#   1. --gpu / --no-gpu flag
#   2. State file  (persisted from last build/run/exec/sh that used a GPU flag)
#   3. Default: "0"
function Load-Gpu {
    if ($IMG2NUM_GPU_FLAG) {
        return $IMG2NUM_GPU_FLAG
    }
    if ((Get-StateValue -Key "GPU") -eq "1") {
        return "1"
    }
    return "0"
}

$IMG2NUM_GPU = (Load-Gpu) -eq "1"

if ($IMG2NUM_GPU) {
    $IMG2NUM_STATE_PREFIX = "GPU_"
    $IMG2NUM_DEFAULT_IMAGE = $IMG2NUM_DEFAULT_GPU_IMAGE
} else {
    $IMG2NUM_STATE_PREFIX = ""
}

# GPU access layers docker-compose.gpu.yml on top of docker-compose.yml to expose NVIDIA GPUs to the container.
$ComposeArgs = @("-f", (Join-Path $PSScriptRoot "docker-compose.yml"))
if ($IMG2NUM_GPU) {
    $ComposeArgs += @("-f", (Join-Path $PSScriptRoot "docker-compose.gpu.yml"))
}

function Invoke-Compose {
    docker compose @ComposeArgs @args
}

# Persists the image (and optionally its pull policy). GPU and non-GPU modes use separate keys
# (GPU_IMAGE/GPU_PULL_POLICY vs IMAGE/PULL_POLICY) so toggling --gpu switches images too.
function Save-State {
    param(
        [string]$Image,
        [string]$PullPolicy = ""
    )

    Set-StateValue -Key "${IMG2NUM_STATE_PREFIX}IMAGE" -Value $Image
    if ($PullPolicy) {
        Set-StateValue -Key "${IMG2NUM_STATE_PREFIX}PULL_POLICY" -Value $PullPolicy
    }
}

# Returns the image to use, in priority order:
#   1. --img, --ghcr-img, --dh-img flag
#   2. IMG2NUM_IMAGE env var (caller-supplied override)
#   3. State file  (persisted from last `up`; GPU_IMAGE in GPU mode)
#   4. Hardcoded default ($IMG2NUM_DEFAULT_GPU_IMAGE in GPU mode)
function Load-Image {
    if ($IMG2NUM_IMAGE_FLAG) {
        return $IMG2NUM_IMAGE_FLAG
    }
    if ($env:IMG2NUM_IMAGE) {
        return $env:IMG2NUM_IMAGE
    }
    $val = Get-StateValue -Key "${IMG2NUM_STATE_PREFIX}IMAGE"
    if ($val) {
        return $val
    }
    return $IMG2NUM_DEFAULT_IMAGE
}

# Returns the Docker Compose pull policy from the state file.
# Falls back to "always" when no policy has been saved.
function Get-PullPolicy {
    param(
        [string]$Image
    )

    $savedImage = Get-StateValue -Key "${IMG2NUM_STATE_PREFIX}IMAGE"
    if ($savedImage -eq $Image) {
        $val = Get-StateValue -Key "${IMG2NUM_STATE_PREFIX}PULL_POLICY"
        if ($val) {
            return $val
        }
    }

    return "always"
}

function Test-DockerImage {
    param([string]$Image)

    docker image inspect $Image *> $null
    return ($LASTEXITCODE -eq 0)
}

# ---------------------------------------------------------------------------
# Container helpers
# ---------------------------------------------------------------------------

# Run a command inside the dev container, using the resolved image.
# The image is exported so docker-compose.yml can reference ${IMG2NUM_IMAGE}.
function Run-InContainer {
    param([string[]]$CmdArgs)

    $image = Load-Image

    # Locally built images don't exist on any registry, so never try to pull them.
    if ($image -like "img2num-dev:*") {
        $pullPolicy = "missing"
        if (-not (Test-DockerImage -Image $image)) {
            if ($IMG2NUM_GPU) {
                # docker-compose.gpu.yml has a build section, so `compose up` builds the missing image.
                Write-Host "Local image $image not found; building it from Dockerfile-gpu.dev..."
                $env:BUILD_DATE = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
                $gitSha = git rev-parse HEAD 2>$null
                $env:GIT_SHA = if ($LASTEXITCODE -eq 0) { "$gitSha" } else { "" }
            } else {
                Write-Error "Error: local image $image not found."
                Write-Host "Run: ./img2num.ps1 build"
                exit 1
            }
        }
    } elseif ($IMG2NUM_IMAGE_SOURCE_SET) {
        $pullPolicy = "always"
    } else {
        $pullPolicy = Get-PullPolicy -Image $image
    }

    if ($IMG2NUM_GPU -and (Test-DockerImage -Image $image)) {
        # Read labels as JSON: nested double quotes in a Go template are mangled by Windows PowerShell.
        $labelsJson = docker image inspect --format '{{json .Config.Labels}}' $image 2>$null
        $isGpuImage = $false
        if ($LASTEXITCODE -eq 0 -and $labelsJson) {
            $labels = ($labelsJson | Out-String) | ConvertFrom-Json
            if ($labels -and $labels.'org.img2num.gpu' -eq "true") {
                $isGpuImage = $true
            }
        }
        if (-not $isGpuImage) {
            Write-Warning "$image was not built from Dockerfile-gpu.dev; Dawn may not see the NVIDIA GPU."
        }
    }

    Save-State -Image $image -PullPolicy $pullPolicy
    if ($IMG2NUM_GPU_FLAG) {
        Set-StateValue -Key "GPU" -Value $IMG2NUM_GPU_FLAG
    }
    $env:IMG2NUM_IMAGE = $image
    $env:IMG2NUM_PULL_POLICY = $pullPolicy

    Invoke-Compose up -d dev

    $ps = Invoke-Compose ps -q --status running dev 2>$null
    if ([string]::IsNullOrWhiteSpace("$ps")) {
        Write-Error "Error: container 'dev' is not running."
        exit 1
    }

    # No TTY in GitHub Actions
    $tty = if ($env:CI) { @("-T") } else { @() }
    Invoke-Compose exec @tty dev @CmdArgs
}

# ---------------------------------------------------------------------------
# Main command dispatch
# ---------------------------------------------------------------------------

# Ensure that Docker is available for the relevant commands.
if ($Mode -in @("build","stop","restart","down","purge","destroy","logs")) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Error: docker is unavailable (not installed, not running or not in PATH)."
        exit 1
    }
}

if ($IMG2NUM_GPU -and $Mode -in @("run","exec","sh","shell","bash","term","terminal")) {
    $runtimes = docker info --format '{{json .Runtimes}}' 2>$null
    if (-not ("$runtimes" -match "nvidia") -and
        -not (Get-Command nvidia-container-runtime-hook -ErrorAction SilentlyContinue)) {
        Write-Warning "NVIDIA Container Toolkit not detected; GPU access will likely fail."
        Write-Warning "See https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html"
    }
}

# BuildKit is required for Dockerfile.dev cache mounts.
if ($Mode -eq "build") {
    docker buildx version *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error: Docker BuildKit is unavailable."
        Write-Error "Ensure Docker Buildx/BuildKit is installed and enabled."
        exit 1
    }
}

# Dockerfile-gpu.dev only layers on top of a prebuilt Dockerfile.dev image, so it needs neither.
if ($Mode -eq "build" -and -not $IMG2NUM_GPU) {
    $dawnCMake = Join-Path $PSScriptRoot "third_party\dawn\CMakeLists.txt"

    if (-not (Test-Path $dawnCMake)) {
        Write-Error "Error: third_party/dawn is not initialized."
        Write-Host "Run: git submodule update --init --recursive"
        exit 1
    }

    $emscriptenConfig = Join-Path $PSScriptRoot ".versions\.emscripten.json"

    if (-not (Test-Path $emscriptenConfig)) {
        Write-Error "Error: .versions/.emscripten.json is missing."
        exit 1
    }
}

switch ($Mode) {
    "build" {
        $buildImage = if ($IMG2NUM_IMAGE_FLAG) {
            $IMG2NUM_IMAGE_FLAG
        } elseif ($env:IMG2NUM_IMAGE) {
            $env:IMG2NUM_IMAGE
        } elseif ($IMG2NUM_GPU) {
            "img2num-dev:gpu"
        } else {
            "img2num-dev:local"
        }

        $dockerfile = if ($IMG2NUM_GPU) { "Dockerfile-gpu.dev" } else { "Dockerfile.dev" }

        $buildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

        $gitSha = git rev-parse HEAD

        $dockerBuildArgs = @(
            "-f", (Join-Path $PSScriptRoot $dockerfile),
            "--build-arg", "BUILD_DATE=$buildDate",
            "--build-arg", "GIT_SHA=$gitSha",
            "-t", $buildImage
        )

        $separatorIndex = [Array]::IndexOf($RemainingArgs, "--")
        $ownArgs = if ($separatorIndex -ge 0) {
            if ($separatorIndex -gt 0) { $RemainingArgs[0..($separatorIndex - 1)] } else { @() }
        } else {
            $RemainingArgs
        }

        if ($ownArgs -contains "--no-cache") {
            $dockerBuildArgs += "--no-cache"
        }

        if ($separatorIndex -ge 0 -and $separatorIndex -lt ($RemainingArgs.Count - 1)) {
            $dockerBuildArgs += $RemainingArgs[($separatorIndex + 1)..($RemainingArgs.Count - 1)]
        }

        $dockerBuildArgs += $PSScriptRoot

        docker build @dockerBuildArgs

        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error: Docker build failed."
            exit $LASTEXITCODE
        }

        Save-State -Image $buildImage -PullPolicy "missing"
        if ($IMG2NUM_GPU_FLAG) {
            Set-StateValue -Key "GPU" -Value $IMG2NUM_GPU_FLAG
        }

        Write-Host "Successfully built $buildImage"
        break
    }
    # Arbitrary one-off commands
    # Run command in shell, then leave
    { $_ -in @("run","exec") } {
        if ($RemainingArgs.Count -gt 0) {
            Run-InContainer -CmdArgs $RemainingArgs
        } else {
            Write-Error "Error: run/exec requires a command."
            exit 1
        }
    }

    # Open a shell in the container
    { $_ -in @("sh","shell","bash","term","terminal") } {
        Run-InContainer -CmdArgs @("bash")
    }

    # Docker management shortcuts
    "stop"    { Invoke-Compose stop }
    "restart" { Invoke-Compose restart }
    "down"    { Invoke-Compose down }

    { $_ -in @("purge","destroy") } {
        Invoke-Compose down --volumes --remove-orphans
        if ($Mode -eq "destroy") {
            $imageToRemove = Load-Image
            Write-Host "Removing $imageToRemove in 5s..."
            Start-Sleep -Seconds 5
            if (Test-DockerImage -Image $imageToRemove) {
                docker rmi $imageToRemove 2>&1 | Out-Null
            }
            # Clear the persisted image and GPU setting so the next `up` falls back to the defaults
            if (Test-Path $IMG2NUM_STATE_FILE) {
                $content = Get-Content -Path $IMG2NUM_STATE_FILE
                $newContent = $content `
                    -replace '^IMAGE=.*', 'IMAGE=' `
                    -replace '^PULL_POLICY=.*', 'PULL_POLICY=' `
                    -replace '^GPU_IMAGE=.*', 'GPU_IMAGE=' `
                    -replace '^GPU_PULL_POLICY=.*', 'GPU_PULL_POLICY=' `
                    -replace '^GPU=.*', 'GPU='
                Set-Content -Path $IMG2NUM_STATE_FILE -Value $newContent -Encoding UTF8
            } else {
                Set-Content `
                    -Path $IMG2NUM_STATE_FILE `
                    -Value @(
                        "# This file is managed by the img2num scripts."
                        "# Do not edit manually."
                        "IMAGE="
                        "PULL_POLICY="
                        "GPU_IMAGE="
                        "GPU_PULL_POLICY="
                        "GPU="
                    ) `
                    -Encoding UTF8
            }
        }
    }

    # Tail logs
    "logs" { Invoke-Compose logs -f }

    { $_ -in @("last-img","last-image") } {
        Load-Image
    }

    # Fallback usage
    default {
        $EXIT_CODE = 0
        if ($Mode -ne "" -and $Mode -notin @("-h","--help")) {
            $EXIT_CODE = 1
            Write-Host "Unknown command used."
            Write-Host ""
        }
        Write-Host @"
Usage:
  ./img2num.ps1 [--img <image:tag>] [--gpu|--no-gpu] <command>

Commands:
    build               Build the local development Docker image.               [--img, --gpu, --no-gpu]
    run|exec <args>     Run arbitrary one-off command inside the container.     [--img, --dh-img, --ghcr-img, --gpu, --no-gpu]
    sh|shell|bash       Opens bash terminal in Docker container.                [--img, --dh-img, --ghcr-img, --gpu, --no-gpu]

    stop                Stops running Docker container (keeps containers, volumes & networks).
    restart             Restarts running Docker container.
    down                Stops running Docker container (keeps volumes).
    purge               Stops running Docker container (removes everything, including orphans).
    destroy             Same as purge, but deletes Docker image.                [--img, --dh-img, --ghcr-img]
    logs                Displays any relevant Docker logs.

    last-img|last-image Displays the resolved Docker image (based on current config).
    -h|--help           Displays this message.

Flags:
  --img                 Use a specific Docker image.
                          For build, this sets the local image tag.
                          E.g.: ./img2num.ps1 build --img img2num-dev:emsdk-bump
  --dh-img              Docker Hub shorthand for --img. Prefixes value with ryanmillard/img2num-dev:
                          E.g.: ./img2num.ps1 sh --dh-img dev
                            Resolves Docker image to ryanmillard/img2num-dev:dev
  --ghcr-img            GitHub shorthand for --img. Prefixes value with ghcr.io/ryan-millard/img2num-dev:
                          E.g.: ./img2num.ps1 sh --ghcr-img dev
                           Resolves Docker image to ghcr.io/ryan-millard/img2num-dev:dev
  --gpu                 Enable NVIDIA GPU access (for Dawn/WebGPU via Vulkan).
                          For build, uses Dockerfile-gpu.dev and defaults the tag to $IMG2NUM_DEFAULT_GPU_IMAGE.
                          The GPU image is layered on ryanmillard/img2num-dev:latest; to use a local base:
                            ./img2num.ps1 build --gpu -- --build-arg IMG2NUM_BASE_IMAGE=img2num-dev:local
                          For run/exec/sh, adds docker-compose.gpu.yml (needs the NVIDIA Container Toolkit).
                          Persisted (with build/run/exec/sh): later commands keep GPU access until --no-gpu.
                            E.g.: ./img2num.ps1 build --gpu; ./img2num.ps1 sh
  --no-gpu              Disable GPU access (and persist that).

GPU Resolution (highest priority first):
  Applies to: all commands that use Docker Compose
  1. --gpu / --no-gpu flags
  2. Last setting used with this script (GPU= in .img2num-state file)
  3. Default: disabled

Image Resolution (highest priority first):
  Applies to: build, run, exec, sh/shell/bash, destroy
  1. Image flags (--img, --dh-img, --ghcr-img)
  2. IMG2NUM_IMAGE env var
  3. Last image used with this script (in .img2num-state file, tracked separately for GPU mode)
  4. Default: ryanmillard/img2num-dev:dev ($IMG2NUM_DEFAULT_GPU_IMAGE in GPU mode)
"@
        exit $EXIT_CODE
    }
}
