#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
# ======================================================================
param(
    [string]$Mode = "",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$RemainingArgs
)

# Resolved image name for this invocation. Mirrors docker-compose.yml default
# so `$env:IMG2NUM_IMAGE=... ; ./img2num.ps1 sh` and a bare `./img2num.ps1 sh`
# both resolve. Matches the default used by docker-compose.yml and the bash
# entry-point.
$IMG2NUM_RESOLVED_IMAGE = if ($env:IMG2NUM_IMAGE) { $env:IMG2NUM_IMAGE } else { "ryanmillard/img2num-dev:latest" }
$IMG2NUM_STATE_FILE = Join-Path $PSScriptRoot ".img2num-state"

# Record the image we're about to start so that a later `./img2num.ps1 destroy`
# in a fresh shell -- where $env:IMG2NUM_IMAGE may no longer be set -- still
# knows which image to remove. Keep it simple: a single KEY=value line.
function Save-State {
    "IMAGE=$IMG2NUM_RESOLVED_IMAGE" | Out-File -FilePath $IMG2NUM_STATE_FILE -Encoding UTF8 -NoNewline:$false
}

# Read the image name persisted by a previous `up`. Falls back to the current
# resolved value (env var or hardcoded default) if the state file is missing
# -- preserves pre-state-file behaviour.
function Load-StateImage {
    if (Test-Path $IMG2NUM_STATE_FILE) {
        $line = Get-Content -Path $IMG2NUM_STATE_FILE -TotalCount 1
        if ($line -match '^IMAGE=(.+)$') {
            return $Matches[1].Trim()
        }
    }
    return $IMG2NUM_RESOLVED_IMAGE
}

# Run a command inside the dev container
function Run-InContainer {
    param([string[]]$CmdArgs)

    Save-State
    docker compose up -d dev
    docker compose exec dev @CmdArgs
}

# -------------------------------
# Main command dispatch
# -------------------------------
switch ($Mode) {

    # Arbitrary pnpm
    "pnpm" {
        $cmd = @("pnpm") + $RemainingArgs
        Run-InContainer -CmdArgs $cmd
    }

    # Open a shell in the container
    { $_ -in @("sh","shell","bash","term","terminal") } {
        Run-InContainer @("bash")
    }

    # Docker maintenance
    "stop"     { docker compose stop }
    "restart"  { docker compose restart }
    "down"     { docker compose down }

    { $_ -in @("purge","destroy") } {
        docker compose down --volumes --remove-orphans
        if ($Mode -eq "destroy") {
            $imageToRemove = Load-StateImage
            docker rmi $imageToRemove 2>$null
            if (Test-Path $IMG2NUM_STATE_FILE) {
                Remove-Item -Path $IMG2NUM_STATE_FILE -Force
            }
        }
    }

    # Logs
    "logs" {
        docker compose logs -f
    }

    # Help / fallback
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
  ./img2num <command>

Commands:
  Using PNPM Directly:
    pnpm <args>       Run arbitrary pnpm command

  Open Container Terminal:
    sh|shell|bash    Opens bash terminal in Docker container

  Docker Maintenance:
    stop             Stops running Docker container (keeps containers, volumes & networks).
    restart          Restarts running Docker container.
    down             Stops running Docker container (keeps volumes).
    purge            Stops running Docker container (removes everything, including orphans).
    destroy          Same as purge, but deletes Docker image.
    logs             Displays any relevant Docker logs.
"@

        exit $EXIT_CODE
    }
}