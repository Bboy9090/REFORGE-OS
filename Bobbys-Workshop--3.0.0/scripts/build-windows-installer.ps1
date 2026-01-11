# Bobby's Workshop - Quick Build Script for Windows
# Creates standalone Windows installers (MSI + NSIS EXE)

param(
    [switch]$SkipClean,
    [switch]$SkipDeps
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔥 Bobby's Workshop                      ║" -ForegroundColor Cyan
Write-Host "║     Windows Installer Builder             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

$missingTools = @()

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js: Not found" -ForegroundColor Red
    $missingTools += "Node.js (https://nodejs.org/)"
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm: Not found" -ForegroundColor Red
    $missingTools += "npm"
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "✓ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust: Not found" -ForegroundColor Red
    $missingTools += "Rust (https://rustup.rs/)"
}

# Check Cargo
try {
    $cargoVersion = cargo --version
    Write-Host "✓ Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Cargo: Not found" -ForegroundColor Red
    $missingTools += "Cargo"
}

# Check Tauri CLI
try {
    $tauriVersion = cargo tauri --version
    Write-Host "✓ Tauri CLI: $tauriVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Tauri CLI: Not found" -ForegroundColor Red
    Write-Host "  Install with: cargo install tauri-cli" -ForegroundColor Yellow
    $missingTools += "Tauri CLI (cargo install tauri-cli)"
}

Write-Host ""

if ($missingTools.Count -gt 0) {
    Write-Host "❌ Missing required tools:" -ForegroundColor Red
    foreach ($tool in $missingTools) {
        Write-Host "   • $tool" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Please install the missing tools and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All prerequisites satisfied!" -ForegroundColor Green
Write-Host ""

# Clean previous builds
if (-not $SkipClean) {
    Write-Host "🧹 Cleaning Previous Build Artifacts..." -ForegroundColor Cyan
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "  Removed dist/" -ForegroundColor Yellow
    }
    if (Test-Path "src-tauri\target") {
        Remove-Item -Recurse -Force "src-tauri\target"
        Write-Host "  Removed src-tauri/target/" -ForegroundColor Yellow
    }
    Write-Host "✓ Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies
if (-not $SkipDeps) {
    Write-Host "📦 Installing Dependencies..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Installing root dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    Push-Location server
    npm install
    Pop-Location
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Build frontend
Write-Host "🏗️  Building Frontend..." -ForegroundColor Cyan
Write-Host ""
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Build Tauri app
Write-Host "🚀 Building Tauri Application for Windows..." -ForegroundColor Cyan
Write-Host ""
Write-Host "This may take 5-10 minutes on first build..." -ForegroundColor Yellow
Write-Host ""

cargo tauri build --target x86_64-pc-windows-msvc

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tauri build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Tauri application built successfully" -ForegroundColor Green
Write-Host ""

# Display results
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Build Results" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$bundleDir = "src-tauri\target\x86_64-pc-windows-msvc\release\bundle"

if (Test-Path $bundleDir) {
    Write-Host "Installer packages created:" -ForegroundColor Green
    Write-Host ""
    
    # Find MSI files
    $msiFiles = Get-ChildItem -Path "$bundleDir\msi" -Filter "*.msi" -ErrorAction SilentlyContinue
    foreach ($file in $msiFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  ✓ MSI Installer: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        Write-Host "    Location: $($file.FullName)" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Find NSIS EXE files
    $nsisFiles = Get-ChildItem -Path "$bundleDir\nsis" -Filter "*-setup.exe" -ErrorAction SilentlyContinue
    foreach ($file in $nsisFiles) {
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  ✓ NSIS Installer: $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        Write-Host "    Location: $($file.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Bundle directory not found at: $bundleDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ BUILD COMPLETE!                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Windows installers are ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the MSI installer on a clean Windows machine" -ForegroundColor White
Write-Host "  2. Test the NSIS installer on a clean Windows machine" -ForegroundColor White
Write-Host "  3. Verify all features work correctly" -ForegroundColor White
Write-Host "  4. Distribute the installer files" -ForegroundColor White
Write-Host ""
Write-Host "Installation guide: STANDALONE_INSTALLER_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
