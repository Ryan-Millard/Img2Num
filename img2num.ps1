#!/usr/bin/env pwsh
# ======================================================================
# ⚠️ Recommended: use Bash / WSL2 for full compatibility
# ======================================================================
param(
    [string]$Mode = "",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$RemainingArgs
)

# Stop execution on errors
$ErrorActionPreference = "Stop"

function Ensure-Container {
    # Check if the dev service container is running, start it if not
    $containerId = docker compose ps -q dev
    if (-not $containerId) {
        Write-Host "Starting dev container..."
        docker compose up -d dev
    }
}

# Run a command inside the dev container
function Run-InContainer {
    param([string[]]$CmdArgs)
    Ensure-Container
    $running = docker ps -q -f "name=img2num-dev"
    if ($running) {
        docker compose exec dev $CmdArgs
    } else {
        docker compose run --rm dev $CmdArgs
    }
}

# Main command dispatch
switch ($Mode.ToLower()) {
    # Commands that map directly to npm scripts
    { $_ -in @("dev","dev:all","dev:debug","dev:all:debug","build","build-js","build-wasm","build-wasm:debug","preview","docs","lint","lint:fix","lint:style","format","format-js","format-wasm","clean","clean-js","clean-wasm","help") } {
        if ($Mode -eq "docs") {
            # Check if terminal supports colors
            $supportsColor = $Host.UI.SupportsVirtualTerminal
            if ($supportsColor) {
                $YELLOW = "`e[33m"
                $MAGENTA = "`e[35m"
                $RESET = "`e[0m"
            } else {
                $YELLOW = ""
                $MAGENTA = ""
                $RESET = ""
            }
            # Informative warning about Docusaurus port forwarding
            Write-Host "${YELLOW}[INFO] Docusaurus is running inside the container, listening on all interfaces (0.0.0.0).${RESET}"
            Write-Host "${YELLOW}[INFO] You cannot use the 0.0.0.0 link directly.${RESET}"
            Write-Host "${YELLOW}[INFO] Access the site in your browser via: ${MAGENTA}http://localhost:3000/Img2Num/info/${RESET}"
        }
        $cmd = @("npm", "run", $Mode) + $RemainingArgs
        Run-InContainer -CmdArgs $cmd
    }
    # Arbitrary npm commands
    "npm" {
        $cmd = @("npm") + $RemainingArgs
        Run-InContainer -CmdArgs $cmd
    }
    # Open a shell in the container
    { $_ -in @("sh","shell","bash","term","terminal") } {
        Run-InContainer -CmdArgs @("bash")
    }
    # Docker management shortcuts
    "stop" { docker compose stop }
    "restart" { docker compose restart }
    "down" { docker compose down }
    { $_ -in @("destroy") } {
        docker compose down --volumes --remove-orphans
        if ($Mode -eq "destroy") {
            docker rmi img2num-dev:latest
        }
    }
    # Tail logs
    "logs" { docker compose logs -f }
    # Fallback usage
    default {
      $EXIT_CODE=0
        Write-Host ""
        if ([string]::IsNullOrEmpty($Mode) -or $Mode -notin @("-h","--help","")) {
            $EXIT_CODE=1
            Write-Host "Unknown command used."
            Write-Host ""
        }
        Write-Host @"
Usage:
  .\img2num.ps1 <command>
Commands:
  NPM Scripts:
    build|build-js|build-wasm|build-wasm:debug
    clean|clean-js|clean-wasm
    dev|dev:all|dev:debug|dev:all:debug
    docs
    format|format-js|format-wasm
    help
    lint|lint:fix|lint:style
    preview
    Use help see more information about each NPM script.
  Using NPM Directly:
    npm <args>       Run arbitrary npm command
  Open Container Terminal:
    sh|shell|bash
  Docker Maintenance:
    stop
    restart
    down
    destroy
    logs
"@
        exit $EXIT_CODE
    }
}
