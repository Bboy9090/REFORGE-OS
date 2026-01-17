param(
  [string]$OutDir = "dist-artifacts/windows",
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Resolve-RepoRoot {
  $root = Resolve-Path (Join-Path $PSScriptRoot "..")
  return $root.Path
}

function Read-TauriConfig([string]$repoRoot) {
  $configPath = Join-Path $repoRoot "src-tauri/tauri.conf.json"
  if (-not (Test-Path $configPath)) {
    throw "Missing Tauri config: $configPath"
  }

  $json = Get-Content -Raw -Encoding UTF8 $configPath | ConvertFrom-Json
  return $json
}

function New-DirectoryIfNotExists([string]$path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Path $path | Out-Null
  }
}

function Copy-IfExists([string]$source, [string]$destinationDir) {
  if (Test-Path $source) {
    Copy-Item -Path $source -Destination $destinationDir -Force
    return $true
  }
  return $false
}

function Invoke-Native([string]$file, [string[]]$argv) {
  & $file @argv
  if ($LASTEXITCODE -ne 0) {
    $joined = ($argv -join ' ')
    throw "Command failed (exit $LASTEXITCODE): $file $joined"
  }
}

function Resolve-TauriCli([string]$repoRoot) {
  $local = Join-Path $repoRoot "tools/tauri-cli-v1/bin/cargo-tauri.exe"
  if (Test-Path $local) {
    return $local
  }
  return "cargo"
}

$repoRoot = Resolve-RepoRoot
$tauriConfig = Read-TauriConfig -repoRoot $repoRoot

# Tauri v2 config format: productName and version are at root level
$productName = $tauriConfig.productName
if (-not $productName) { $productName = $tauriConfig.package.productName }
if (-not $productName) { $productName = "Bobbys-Workshop" }

$tauriVersion = $tauriConfig.version
if (-not $tauriVersion) { $tauriVersion = $tauriConfig.package.version }
if (-not $tauriVersion) { $tauriVersion = "unknown" }

$outAbs = Join-Path $repoRoot $OutDir
New-DirectoryIfNotExists $outAbs

Write-Host "Repo: $repoRoot"
Write-Host "Product: $productName"
Write-Host "Version: $tauriVersion"
Write-Host "OutDir: $outAbs"

if (-not $SkipBuild) {
  Write-Host "Building frontend (npm run build)..."
  Push-Location $repoRoot
  try {
    Invoke-Native -file "npm" -argv @("run", "build")

    $tauriCli = Resolve-TauriCli -repoRoot $repoRoot
    if ($tauriCli -eq "cargo") {
      Write-Host "Building Tauri bundle using global CLI (cargo tauri build --target x86_64-pc-windows-msvc)..."
      Invoke-Native -file "cargo" -argv @("tauri", "build", "--target", "x86_64-pc-windows-msvc")
    } else {
      Write-Host "Building Tauri bundle using repo-local v1 CLI ($tauriCli build --target x86_64-pc-windows-msvc)..."
      Invoke-Native -file $tauriCli -argv @("build", "--target", "x86_64-pc-windows-msvc")
    }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "Skipping build; collecting existing artifacts only."
}

$releaseDirCandidates = @(
  (Join-Path $repoRoot "src-tauri/target/x86_64-pc-windows-msvc/release"),
  (Join-Path $repoRoot "src-tauri/target/release")
)

$releaseDir = $null
foreach ($candidate in $releaseDirCandidates) {
  if (Test-Path (Join-Path $candidate "bundle")) {
    $releaseDir = $candidate
    break
  }
}

if (-not $releaseDir) {
  throw "No build outputs found. Tried: $($releaseDirCandidates -join ', '). Run this script without -SkipBuild to build first."
}

$bundleDir = Join-Path $releaseDir "bundle"

$collected = @()

# Installer artifacts
$nsisDir = Join-Path $bundleDir "nsis"
if (Test-Path $nsisDir) {
  $nsisInstallers = Get-ChildItem -Path $nsisDir -Filter "*-setup.exe" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "$productName*" -and $_.Name -like "*$tauriVersion*" }
  foreach ($f in $nsisInstallers) {
    Copy-Item $f.FullName -Destination $outAbs -Force
    $collected += $f.FullName
  }
}

$msiDir = Join-Path $bundleDir "msi"
if (Test-Path $msiDir) {
  $msis = Get-ChildItem -Path $msiDir -Filter "*.msi" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "$productName*" -and $_.Name -like "*$tauriVersion*" }
  foreach ($f in $msis) {
    Copy-Item $f.FullName -Destination $outAbs -Force
    $collected += $f.FullName
  }
}

# App executable
$appCandidates = @(
  (Join-Path $releaseDir "app.exe"),
  (Join-Path $releaseDir "bobbys-workshop.exe"),
  (Join-Path $releaseDir ("{0}.exe" -f $productName)),
  (Join-Path $releaseDir ("{0}.exe" -f ($productName -replace "\s+", "-")))
)

$appFound = $false
foreach ($candidate in $appCandidates) {
  if (Copy-IfExists -source $candidate -destinationDir $outAbs) {
    $collected += $candidate
    $appFound = $true
    break
  }
}

if (-not $appFound) {
  throw "Could not find app executable in $releaseDir (tried: $($appCandidates -join ', '))."
}

if ($collected.Count -eq 0) {
  throw "No artifacts were collected. Expected NSIS/MSI installers under $bundleDir and an EXE under $releaseDir."
}

Write-Host "Collected artifacts:"
$collected | ForEach-Object { Write-Host " - $_" }

Write-Host "\nDone. Folder ready: $outAbs"
