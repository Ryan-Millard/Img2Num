# Build + install Dawn from third_party/dawn using flags in .versions/dawn.json.
# One recipe for CI on Windows (see issue #634). Mirror of scripts/build-dawn.sh.
# Usage: build-dawn.ps1 -Prefix <dir> [-Src <dir>] [-BuildDir <dir>] [-Help]
param(
  [string]$Prefix = "",
  [string]$Src = "",
  [string]$BuildDir = "",
  [switch]$Help
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path (Split-Path $MyInvocation.MyCommand.Path -Parent) -Parent
$DAWN_JSON = Join-Path $ROOT ".versions/dawn.json"

function Get-DawnFlag {
  param([string]$Key)
  $val = node (Join-Path $ROOT "scripts/read-version.js") $DAWN_JSON $Key
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  return $val
}

function Invoke-Native {
  $cmd = $Args[0]
  $rest = @($Args | Select-Object -Skip 1)
  & $cmd @rest
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($Help) {
  Write-Output "Flags from $DAWN_JSON (dry run, no build):"
  foreach ($key in @("dawn_sha", "CMAKE_BUILD_TYPE", "CMAKE_MSVC_RUNTIME_LIBRARY", "MACOSX_DEPLOYMENT_TARGET",
    "DAWN_SUPPORTS_GLFW_FOR_WINDOWING", "DAWN_USE_X11", "DAWN_FETCH_DEPENDENCIES", "DAWN_ENABLE_INSTALL",
    "DAWN_BUILD_TESTS", "DAWN_BUILD_SAMPLES", "DAWN_USE_GLFW", "TINT_BUILD_TESTS", "TINT_BUILD_CMD_TOOLS",
    "TINT_BUILD_GLSL_VALIDATOR", "DAWN_BUILD_PROTOBUF", "TINT_BUILD_IR_BINARY")) {
    Write-Output "  $key=$(Get-DawnFlag $key)"
  }
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Prefix)) { Write-Error "-Prefix is required"; exit 1 }
if ([string]::IsNullOrWhiteSpace($Src)) { $Src = Join-Path $ROOT "third_party/dawn" }
if ([string]::IsNullOrWhiteSpace($BuildDir)) { $BuildDir = Join-Path $ROOT "build/dawn" }

$Gen = @()
if (Get-Command ninja -ErrorAction SilentlyContinue) { $Gen += "-GNinja" }

$BuildType = Get-DawnFlag CMAKE_BUILD_TYPE

Invoke-Native cmake -S "$Src" -B "$BuildDir" @Gen `
  "-DCMAKE_BUILD_TYPE=$(Get-DawnFlag CMAKE_BUILD_TYPE)" `
  "-DCMAKE_MSVC_RUNTIME_LIBRARY=$(Get-DawnFlag CMAKE_MSVC_RUNTIME_LIBRARY)" `
  "-DCMAKE_OSX_DEPLOYMENT_TARGET=$(Get-DawnFlag MACOSX_DEPLOYMENT_TARGET)" `
  "-DCMAKE_POLICY_DEFAULT_CMP0091=NEW" `
  "-DDAWN_SUPPORTS_GLFW_FOR_WINDOWING=$(Get-DawnFlag DAWN_SUPPORTS_GLFW_FOR_WINDOWING)" `
  "-DDAWN_USE_X11=$(Get-DawnFlag DAWN_USE_X11)" `
  "-DDAWN_FETCH_DEPENDENCIES=$(Get-DawnFlag DAWN_FETCH_DEPENDENCIES)" `
  "-DDAWN_ENABLE_INSTALL=$(Get-DawnFlag DAWN_ENABLE_INSTALL)" `
  "-DDAWN_BUILD_TESTS=$(Get-DawnFlag DAWN_BUILD_TESTS)" `
  "-DDAWN_BUILD_SAMPLES=$(Get-DawnFlag DAWN_BUILD_SAMPLES)" `
  "-DDAWN_USE_GLFW=$(Get-DawnFlag DAWN_USE_GLFW)" `
  "-DTINT_BUILD_TESTS=$(Get-DawnFlag TINT_BUILD_TESTS)" `
  "-DTINT_BUILD_CMD_TOOLS=$(Get-DawnFlag TINT_BUILD_CMD_TOOLS)" `
  "-DTINT_BUILD_GLSL_VALIDATOR=$(Get-DawnFlag TINT_BUILD_GLSL_VALIDATOR)" `
  "-DDAWN_BUILD_PROTOBUF=$(Get-DawnFlag DAWN_BUILD_PROTOBUF)" `
  "-DTINT_BUILD_IR_BINARY=$(Get-DawnFlag TINT_BUILD_IR_BINARY)"
Invoke-Native cmake --build "$BuildDir" --config $BuildType --parallel
Invoke-Native cmake --install "$BuildDir" --config $BuildType --prefix "$Prefix"
