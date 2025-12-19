#!/usr/bin/env pwsh
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
        # container exists but is not running yet, run the command in a temporary container
        docker compose run --rm dev $CmdArgs
    }
}

# If Mode is empty, show help
if (-not $Mode) { $Mode = "help" }

switch ($Mode.ToLower()) {
    "dev"             { Run-InContainer -CmdArgs @("npm","run","dev") }
    "dev:all"         { Run-InContainer -CmdArgs @("npm","run","dev:all") }
    "dev:debug"       { Run-InContainer -CmdArgs @("npm","run","dev:debug") }
    "dev:all:debug"   { Run-InContainer -CmdArgs @("npm","run","dev:all:debug") }
    "build"           { Run-InContainer -CmdArgs @("npm","run","build") }
    "build-js"        { Run-InContainer -CmdArgs @("npm","run","build-js") }
    "build-wasm"      { Run-InContainer -CmdArgs @("npm","run","build-wasm") }
    "build-wasm:debug"{ Run-InContainer -CmdArgs @("npm","run","build-wasm:debug") }
    "preview"         { Run-InContainer -CmdArgs @("npm","run","preview") }
    "docs"            { Run-InContainer -CmdArgs @("npm","run","docs") }
    "lint"            { Run-InContainer -CmdArgs @("npm","run","lint") }
    "lint:fix"        { Run-InContainer -CmdArgs @("npm","run","lint:fix") }
    "lint:style"      { Run-InContainer -CmdArgs @("npm","run","lint:style") }
    "format"          { Run-InContainer -CmdArgs @("npm","run","format") }
    "format-js"       { Run-InContainer -CmdArgs @("npm","run","format-js") }
    "format-wasm"     { Run-InContainer -CmdArgs @("npm","run","format-wasm") }
    "clean"           { Run-InContainer -CmdArgs @("npm","run","clean") }
    "clean-js"        { Run-InContainer -CmdArgs @("npm","run","clean-js") }
    "clean-wasm"      { Run-InContainer -CmdArgs @("npm","run","clean-wasm") }
    "help"            { Run-InContainer -CmdArgs @("npm","run","help") }

    # Arbitrary npm commands
    "npm" {
      $cmd = @("npm") + $args
        Run-InContainer -CmdArgs $cmd
    }


    # Open a shell in the container
    "sh"    { Run-InContainer -CmdArgs @("bash") }
    "shell" { Run-InContainer -CmdArgs @("bash") }
    "bash"  { Run-InContainer -CmdArgs @("bash") }
    "term"  { Run-InContainer -CmdArgs @("bash") }
    "terminal" { Run-InContainer -CmdArgs @("bash") }

    # Docker management shortcuts
    "stop"    { docker compose stop }
    "restart" { docker compose restart }
    "down"    { docker compose down }
    "clean"   { docker compose down --volumes --remove-orphans }
    "destroy" {
        docker compose down --volumes --remove-orphans
        docker rmi img2num-dev:latest
    }
    "logs"            { docker compose logs -f }

    default {
        Write-Host "Unknown command used.`n"
        & "$PSScriptRoot\img2num.ps1" help
        exit 1
    }
}
