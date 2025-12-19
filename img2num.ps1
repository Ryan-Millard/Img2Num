#!/usr/bin/env pwsh

# ======================================================================
# ⚠ Recommended: use Bash / WSL2 for full compatibility
# ======================================================================

param(
    [string]$Mode = ""
)

function Ensure-Container {
    $container = docker ps -q -f "name=img2num-dev"
    if (-not $container) {
        Write-Host "Starting dev container..."
        docker compose up -d dev
    }
}

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

# Default to help if no mode is provided
if (-not $Mode) { $Mode = "help" }

# List of NPM scripts
$npmScripts = @(
    "dev","dev:all","dev:debug","dev:all:debug",
    "build","build-js","build-wasm","build-wasm:debug",
    "preview",
    "docs",
    "lint","lint:fix","lint:style",
    "format","format-js","format-wasm",
    "clean","clean-js","clean-wasm",
    "help"
)

$shellModes = @(
    "sh",
    "shell",
    "bash",
    "term",
    "terminal"
)

switch ($Mode.ToLower()) {
    # Handle all npm scripts
    { $npmScripts -contains $_ } {
        $cmd = @("npm","run", $Mode) + $args
        Run-InContainer -CmdArgs $cmd
    }

    # Arbitrary npm commands
    "npm" {
        $cmd = @("npm") + $args
        Run-InContainer -CmdArgs $cmd
    }

    # Open a shell in the container
    { $shellModes -contains $_ } { Run-InContainer -CmdArgs @("bash") }

    # Docker management shortcuts
    "stop"    { docker compose stop }
    "restart" { docker compose restart }
    "down"    { docker compose down }
    "clean"   { docker compose down --volumes --remove-orphans }
    "destroy" {
        docker compose down --volumes --remove-orphans
        docker rmi img2num-dev:latest
    }
    "logs" { docker compose logs -f }

    default {
        Write-Host "Unknown command used.`n"
        & "$PSScriptRoot\img2num.ps1" help
        exit 1
    }
}
