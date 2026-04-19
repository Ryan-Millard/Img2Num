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
$FilteredArgs = [System.Collections.Generic.List[string]]::new()

for ($i = 0; $i -lt $AllArgs.Count; $i++) {
    if ($AllArgs[$i] -eq "--img") {
        $i++
        $IMG2NUM_IMAGE_FLAG = $AllArgs[$i]
    } else {
        $FilteredArgs.Add($AllArgs[$i])
    }
}

$Mode = if ($FilteredArgs.Count -gt 0) { $FilteredArgs[0]; $FilteredArgs.RemoveAt(0) } else { "" }
$RemainingArgs = $FilteredArgs.ToArray()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
$IMG2NUM_DEFAULT_IMAGE = "ryanmillard/img2num-dev:latest"
$IMG2NUM_STATE_FILE = Join-Path $PSScriptRoot ".img2num-state"

# ---------------------------------------------------------------------------
# State helpers
# ---------------------------------------------------------------------------

function Save-State {
    param([string]$Image)
    Set-Content -Path $IMG2NUM_STATE_FILE -Value "IMAGE=$Image" -Encoding UTF8
}

# Returns the image to use, in priority order:
#   1. --img flag
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
        $line = Get-Content -Path $IMG2NUM_STATE_FILE -TotalCount 1
        if ($line -match '^IMAGE=(.+)$') {
            $val = $Matches[1].Trim()
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
    docker compose exec dev @CmdArgs
}

# ---------------------------------------------------------------------------
# Main command dispatch
# ---------------------------------------------------------------------------
switch ($Mode) {
    "pnpm" {
        Run-InContainer -CmdArgs (@("pnpm") + $RemainingArgs)
    }
    { $_ -in @("sh","shell","bash","term","terminal") } {
        Run-InContainer -CmdArgs @("bash")
    }
    "stop"    { docker compose stop }
    "restart" { docker compose restart }
    "down"    { docker compose down }
    { $_ -in @("purge","destroy") } {
        docker compose down --volumes --remove-orphans
        if ($Mode -eq "destroy") {
            $imageToRemove = Load-Image
            Write-Host "Removing $imageToRemove in 5s..."
            Start-Sleep -Seconds 5
            docker rmi $imageToRemove 2>$null
            # Clear the persisted image so the next `up` falls back to the default
            Set-Content -Path $IMG2NUM_STATE_FILE -Value "IMAGE=" -Encoding UTF8
        }
    }
    "logs" {
        docker compose logs -f
    }
    default {
        $EXIT_CODE = 0
        Write-Host ""
        if ($Mode -ne "" -and $Mode -notin @("-h","--help")) {
            $EXIT_CODE = 1
            Write-Host "Unknown command used."
            Write-Host ""
        }
        Write-Host @"
Usage:
  ./img2num.ps1 [--img <image:tag>] <command>

  --img applies to commands that start or remove a container (pnpm, sh, destroy).
  It has no effect on lifecycle commands (stop, restart, down, purge, logs).

Commands:
  Using PNPM Directly:
    pnpm <args>       Run arbitrary pnpm command.              [--img]
  Open Container Terminal:
    sh|shell|bash     Opens bash terminal in Docker container. [--img]
  Docker Maintenance:
    stop              Stops running Docker container (keeps containers, volumes & networks).
    restart           Restarts running Docker container.
    down              Stops running Docker container (keeps volumes).
    purge             Stops running Docker container (removes everything, including orphans).
    destroy           Same as purge, but deletes Docker image. [--img]
    logs              Displays any relevant Docker logs.

Image Resolution (highest priority first):
  Applies to: pnpm, sh/shell/bash, destroy
  1. --img flag
                      ./img2num.ps1 --img <image:tag> <command>
  2. IMG2NUM_IMAGE env var
                      `$env:IMG2NUM_IMAGE=<image:tag>; ./img2num.ps1 <command>
  3. Last image used with this script (in .img2num-state file)
  4. Default: $IMG2NUM_DEFAULT_IMAGE
"@
        exit $EXIT_CODE
    }
}