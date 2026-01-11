# Simple Build Script for Bobby's Workshop
param(
    [switch]$SkipClean,
    [switch]$SkipDeps
)

$ErrorActionPreference = "Stop"

Write-Host "Building Bobby's Workshop..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

$missingTools = @()

try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js: Not found" -ForegroundColor Red
    $missingTools += "Node.js"
}

try {
    $rustVersion = rustc --version
    Write-Host "Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "Rust: Not found" -ForegroundColor Red
    $missingTools += "Rust"
}

try {
    $tauriVersion = cargo tauri --version
    Write-Host "Tauri CLI: $tauriVersion" -ForegroundColor Green
} catch {
    Write-Host "Tauri CLI: Not found" -ForegroundColor Red
    $missingTools += "Tauri CLI"
}

if ($missingTools.Count -gt 0) {
    Write-Host "Missing tools: $($missingTools -join ', ')" -ForegroundColor Red
    exit 1
}

# Clean previous builds
if (-not $SkipClean) {
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "src-tauri\target") { Remove-Item -Recurse -Force "src-tauri\target" }
}

# Install dependencies
if (-not $SkipDeps) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { exit 1 }
    
    Push-Location server
    npm install
    Pop-Location
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# Build Tauri app
Write-Host "Building Tauri application..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray

cargo tauri build --target x86_64-pc-windows-msvc

if ($LASTEXITCODE -ne 0) {
    Write-Host "Tauri build failed" -ForegroundColor Red
    exit 1
}

# Display results
Write-Host "Build completed successfully!" -ForegroundColor Green

$bundleDir = "src-tauri\target\x86_64-pc-windows-msvc\release\bundle"

if (Test-Path $bundleDir) {
    Write-Host "Installer packages created:" -ForegroundColor Green
    
    # Find MSI files
    $msiFiles = Get-ChildItem -Path "$bundleDir\msi" -Filter "*.msi" -ErrorAction SilentlyContinue
    foreach ($file in $msiFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "MSI Installer: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        Write-Host "Location: $($file.FullName)" -ForegroundColor Gray
    }
    
    # Find NSIS EXE files
    $nsisFiles = Get-ChildItem -Path "$bundleDir\nsis" -Filter "*-setup.exe" -ErrorAction SilentlyContinue
    foreach ($file in $nsisFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "NSIS Installer: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        Write-Host "Location: $($file.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "Bundle directory not found at: $bundleDir" -ForegroundColor Yellow
}

Write-Host "Windows installers are ready!" -ForegroundColor Cyan