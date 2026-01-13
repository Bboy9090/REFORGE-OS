# Build REFORGE OS Installer (MSI for Windows)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Building REFORGE OS Installer                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Build Frontend
Write-Host "Step 1: Building frontend..." -ForegroundColor Yellow
npm run vite:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built" -ForegroundColor Green
Write-Host ""

# Step 2: Build Tauri Bundle (MSI Installer)
Write-Host "Step 2: Building Tauri installer (this may take several minutes)..." -ForegroundColor Yellow
Write-Host ""

# Try npm script first
npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm tauri:build failed, trying direct cargo build..." -ForegroundColor Yellow
    cd src-tauri
    cargo build --release
    cd ..
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Build failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Locating installer..." -ForegroundColor Yellow

# Check for MSI installer
$MsiPath = Join-Path $ScriptDir "src-tauri\target\release\bundle\msi\REFORGE OS_3.0.0_x64_en-US.msi"
$ExePath = Join-Path $ScriptDir "src-tauri\target\release\workshop-ui.exe"

if (Test-Path $MsiPath) {
    Write-Host "✓ MSI Installer created!" -ForegroundColor Green
    Write-Host "  Location: $MsiPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now distribute this installer to users." -ForegroundColor Yellow
    Write-Host "Users can double-click to install REFORGE OS." -ForegroundColor Gray
} elseif (Test-Path $ExePath) {
    Write-Host "✓ Executable created (MSI bundling may have failed)" -ForegroundColor Yellow
    Write-Host "  Location: $ExePath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Note: MSI installer not found. Using portable executable instead." -ForegroundColor Yellow
} else {
    Write-Host "✗ Build output not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Build Complete!                                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the installer on a clean system" -ForegroundColor Gray
Write-Host "  2. Distribute the MSI file to users" -ForegroundColor Gray
Write-Host "  3. Users install and launch from Start Menu" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Backend API must be started separately or use launcher script." -ForegroundColor Yellow
