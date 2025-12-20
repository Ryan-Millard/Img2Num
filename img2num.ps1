#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
# ======================================================================
param(
    [string]$Mode = "",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$RemainingArgs
)

function Ensure-Container {
    # Get container ID (may exist but be stopped)
    $containerId = docker compose ps -q dev

    # Container does not exist → create & start
    if (-not $containerId) {
        Write-Host "Starting dev container..."
        docker compose up -d dev
        return
    }

    # Container exists but is stopped → start it
    $running = docker inspect -f '{{.State.Running}}' $containerId 2>$null
    if ($running -ne "true") {
        Write-Host "Dev container exists but is stopped. Starting..."
        docker compose start dev
    }
}

# Run a command inside the dev container
function Run-InContainer {
    param([string[]]$CmdArgs)

    Ensure-Container
    docker compose exec dev @CmdArgs
}

# -------------------------------
# Main command dispatch
# -------------------------------
switch ($Mode) {

    # NPM scripts
    { $_ -in @(
        "dev","dev:all","dev:debug","dev:all:debug",
        "build","build-js","build-wasm","build-wasm:debug",
        "preview","docs",
        "lint","lint:fix","lint:style",
        "format","format-js","format-wasm",
        "clean","clean-js","clean-wasm",
        "help"
    ) } {

        if ($Mode -eq "docs") {
            $YELLOW = $MAGENTA = $RESET = ""
            # Check if terminal supports colors
            $supportsColor = $Host.UI.SupportsVirtualTerminal
            if ($supportsColor) {
                $YELLOW  = "`e[33m"
                $MAGENTA = "`e[35m"
                $RESET   = "`e[0m"
            }

            Write-Host "${YELLOW}[INFO] Docusaurus is running inside the container, listening on all interfaces (0.0.0.0).${RESET}"
            Write-Host "${YELLOW}[INFO] You cannot use the 0.0.0.0 link directly.${RESET}"
            Write-Host "${YELLOW}[INFO] Access the site in your browser via: ${MAGENTA}http://localhost:3000/Img2Num/info/${RESET}"
        }
        $cmd = @("npm", "run", $Mode) + $RemainingArgs
        Run-InContainer -CmdArgs $cmd
    }

    # Arbitrary npm
    "npm" {
        $cmd = @("npm") + $RemainingArgs
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
  NPM Scripts (use help to see more info about each script):
    build|build-js|build-wasm|build-wasm:debug
    clean|clean-js|clean-wasm
    dev|dev:all|dev:debug|dev:all:debug
    docs
    format|format-js|format-wasm
    help
    lint|lint:fix|lint:style
    preview

  Using NPM Directly:
    npm <args>       Run arbitrary npm command

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
