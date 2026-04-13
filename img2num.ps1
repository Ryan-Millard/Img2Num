#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
# ======================================================================
param(
    [string]$Mode = "",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$RemainingArgs
)

# Run a command inside the dev container
function Run-InContainer {
    param([string[]]$CmdArgs)

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
            docker rmi img2num-dev:latest
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