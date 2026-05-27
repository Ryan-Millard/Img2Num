#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
#
#   You may need to run: powershell -ExecutionPolicy Bypass -File .\img2num.ps1 ...
# ======================================================================

# ---------------------------------------------------------------------------
# Argument parsing — strip --img <value> from args before mode dispatch
# ---------------------------------------------------------------------------
param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$AllArgs
)

$IMG2NUM_IMAGE_FLAG = ""
$IMG2NUM_IMAGE_SOURCE_SET = $false
$FilteredArgs = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $AllArgs.Count; $i++) {
    $arg = $AllArgs[$i]
    if ($arg -in @("--img", "--dh-img", "--ghcr-img")) {
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
$IMG2NUM_STATE_FILE = Join-Path $PSScriptRoot ".img2num-state"

# ---------------------------------------------------------------------------
# State helpers
# ---------------------------------------------------------------------------

function Save-State {
    param([string]$Image)
    if ((Test-Path $IMG2NUM_STATE_FILE) -and (Select-String -Path $IMG2NUM_STATE_FILE -Pattern '^IMAGE=' -Quiet)) {
        $content = Get-Content -Path $IMG2NUM_STATE_FILE
        $replaced = $false
        $newContent = $content | ForEach-Object {
            if (-not $replaced -and $_ -match '^IMAGE=') {
                $replaced = $true
                "IMAGE=$Image"
            } else {
                $_
            }
        }
        Set-Content -Path $IMG2NUM_STATE_FILE -Value $newContent -Encoding UTF8
    } else {
        Add-Content -Path $IMG2NUM_STATE_FILE -Value "IMAGE=$Image" -Encoding UTF8
    }
}

# Returns the image to use, in priority order:
#   1. --img, --ghcr-img, --dh-img flag
#   2. IMG2NUM_IMAGE env var (caller-supplied override)
#   3. State file  (persisted from last `up`)
#   4. Hardcoded default
function Load-Image {
    if ($IMG2NUM_IMAGE_FLAG) {
        return $IMG2NUM_IMAGE_FLAG
    }
    if ($env:IMG2NUM_IMAGE) {
        return $env:IMG2NUM_IMAGE
    }
    if (Test-Path $IMG2NUM_STATE_FILE) {
        $match = Select-String -Path $IMG2NUM_STATE_FILE -Pattern '^IMAGE=(.*)$' | Select-Object -First 1
        if ($match) {
            $val = $match.Matches[0].Groups[1].Value.Trim()
            if ($val) { return $val }
        }
    }
    return $IMG2NUM_DEFAULT_IMAGE
}

# ---------------------------------------------------------------------------
# Container helpers
# ---------------------------------------------------------------------------

# Run a command inside the dev container, using the resolved image.
# The image is exported so docker-compose.yml can reference ${IMG2NUM_IMAGE}.
function Run-InContainer {
    param([string[]]$CmdArgs)
    $image = Load-Image
    Save-State -Image $image
    $env:IMG2NUM_IMAGE = $image
    docker compose up -d dev
    $ps = docker compose ps -q --status running dev 2>&1
    if ([string]::IsNullOrWhiteSpace($ps)) {
        Write-Error "Error: container 'dev' is not running."
        exit 1
    }

    $tty = if ($env:CI) { @("-T") } else { @() }
    docker compose exec @tty dev @CmdArgs
}

# ---------------------------------------------------------------------------
# Main command dispatch
# ---------------------------------------------------------------------------

# Ensure that Docker is available for the relevant commands.
if ($Mode -in @("stop","restart","down","purge","destroy","logs")) {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Error: docker is unavailable (not installed, not running or not in PATH)."
        exit 1
    }
}

switch ($Mode) {
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
    "stop"    { docker compose stop }
    "restart" { docker compose restart }
    "down"    { docker compose down }

    { $_ -in @("purge","destroy") } {
        docker compose down --volumes --remove-orphans
        if ($Mode -eq "destroy") {
            $imageToRemove = Load-Image
            Write-Host "Removing $imageToRemove in 5s..."
            Start-Sleep -Seconds 5
            docker image inspect $imageToRemove 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                docker rmi $imageToRemove 2>&1 | Out-Null
            }
            # Clear the persisted image so the next `up` falls back to the default
            if (Test-Path $IMG2NUM_STATE_FILE) {
                $content = Get-Content -Path $IMG2NUM_STATE_FILE
                $newContent = $content -replace '^IMAGE=.*', 'IMAGE='
                Set-Content -Path $IMG2NUM_STATE_FILE -Value $newContent -Encoding UTF8
            } else {
                Add-Content -Path $IMG2NUM_STATE_FILE -Value "IMAGE=" -Encoding UTF8
            }
        }
    }

    # Tail logs
    "logs" { docker compose logs -f }

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
  ./img2num.ps1 [--img <image:tag>] <command>

Commands:
    run|exec <args>     Run arbitrary one-off command inside the container.     [--img, --dh-img, --ghcr-img]
    sh|shell|bash       Opens bash terminal in Docker container.                [--img, --dh-img, --ghcr-img]

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
                          E.g.: ./img2num.ps1 sh --img ryanmillard/img2num-dev:dev
  --dh-img              Docker Hub shorthand for --img. Prefixes value with ryan-millard/img2num-dev:
                          E.g.: ./img2num.ps1 sh --dh-img dev
                            Resolves Docker image to ryan-millard/img2num-dev:dev
  --ghcr-img            GitHub shorthand for --img. Prefixes value with ryan-millard/img2num-dev:
                          E.g.: ./img2num.ps1 sh --ghcr-img dev
                           Resolves Docker image to ghcr.io/ryan-millard/img2num-dev:

Image Resolution (highest priority first):
  Applies to: run, exec, sh/shell/bash, destroy
  1. Image flags (--img, --dh-img, --ghcr-img)
  2. IMG2NUM_IMAGE env var
  3. Last image used with this script (in .img2num-state file)
  4. Default: $IMG2NUM_DEFAULT_IMAGE
"@
        exit $EXIT_CODE
    }
}