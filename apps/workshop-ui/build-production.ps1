# REFORGE OS - Production Build Script
# Builds Tauri app with bundled Python runtime for Windows and macOS

param(
    [string]$Platform = "all",
    [switch]$SkipPython = $false
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "🚀 REFORGE OS Production Build" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Bundle Python Runtime
if (-not $SkipPython) {
    Write-Host "`n📦 Step 1: Bundling Python Runtime..." -ForegroundColor Yellow
    
    if ($IsWindows -or $env:OS -like "*Windows*") {
        & "$PSScriptRoot\bundle-python-windows.ps1"
    } else {
        & "$PSScriptRoot\bundle-python-unix.sh"
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Python bundling failed!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Build Frontend
Write-Host "`n🔨 Step 2: Building Frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build Tauri App
Write-Host "`n⚙️ Step 3: Building Tauri Application..." -ForegroundColor Yellow

if ($Platform -eq "all" -or $Platform -eq "windows") {
    Write-Host "Building Windows installer..." -ForegroundColor Cyan
    npm run tauri build -- --target x86_64-pc-windows-msvc
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Windows build failed!" -ForegroundColor Red
        exit 1
    }
}

if ($Platform -eq "all" -or $Platform -eq "macos") {
    Write-Host "Building macOS app bundle..." -ForegroundColor Cyan
    npm run tauri build -- --target x86_64-apple-darwin
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ macOS build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Creating DMG..." -ForegroundColor Cyan
    & "$PSScriptRoot\create-dmg.sh"
}

Write-Host "`n✅ Build Complete!" -ForegroundColor Green
Write-Host "Installers are in: src-tauri/target/release/bundle/" -ForegroundColor Cyan
