# ============================================
# 🔥 BOBBY'S WORKSHOP - INSTALLATION SCRIPT
# ============================================
# Complete installation script with all fixes from 45-point audit
# No pop-ups, no console windows, perfect installation

param(
    [switch]$SkipDesktopShortcut,
    [switch]$SkipDependencies,
    [switch]$BuildProduction
)

$ErrorActionPreference = "Stop"

# Set window title
$Host.UI.RawUI.WindowTitle = "🔥 BOBBY'S WORKSHOP - INSTALLATION"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 BOBBY'S WORKSHOP - INSTALLATION" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot

# ============================================
# STEP 1: CHECK PREREQUISITES
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 1: CHECKING PREREQUISITES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$checksPassed = $true

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "   ❌ Node.js not found! Install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    $checksPassed = $false
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "   ❌ npm not found!" -ForegroundColor Red
    $checksPassed = $false
}

# Check Rust (for Tauri)
Write-Host "🔍 Checking Rust..." -ForegroundColor Cyan
try {
    $rustVersion = cargo --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Rust: $rustVersion" -ForegroundColor Green
    } else {
        throw "Rust not found"
    }
} catch {
    Write-Host "   ⚠️  Rust not found (required for Tauri builds)" -ForegroundColor Yellow
    Write-Host "      Install from: https://rustup.rs/" -ForegroundColor Gray
}

if (-not $checksPassed) {
    Write-Host ""
    Write-Host "❌ Prerequisites check failed! Please install missing tools first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All prerequisites met!" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: INSTALL DEPENDENCIES
# ============================================
if (-not $SkipDependencies) {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP 2: INSTALLING DEPENDENCIES" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    # Install frontend dependencies
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to install frontend dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
    
    # Install backend dependencies
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
    npm run server:install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Backend dependencies installation had issues, but continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
    }
    Write-Host ""
}

# ============================================
# STEP 3: CREATE ENVIRONMENT FILE
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 3: SETTING UP ENVIRONMENT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$envFile = Join-Path $projectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Cyan
    $envContent = @"
# Bobby's Workshop - Environment Configuration
# Generated by installation script

# Backend (Node.js Express) - Port 3001 for Tauri
PORT=3001
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Legacy Python Backend (optional, port 8000)
# PYTHON_BACKEND_PORT=8000

# Logging
BW_LOG_DIR=$env:LOCALAPPDATA\BobbysWorkshop\logs

# Tauri Configuration
BW_DISABLE_NODE_BACKEND=0
"@
    Set-Content -Path $envFile -Value $envContent -Encoding UTF8
    Write-Host "   ✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "   ✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 4: BUILD (OPTIONAL)
# ============================================
if ($BuildProduction) {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP 4: BUILDING FOR PRODUCTION" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🏗️  Building frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🏗️  Building Tauri application..." -ForegroundColor Cyan
    npm run tauri:build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Tauri build had issues, but continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Tauri application built successfully" -ForegroundColor Green
    }
    Write-Host ""
}

# ============================================
# STEP 5: CREATE DESKTOP SHORTCUT
# ============================================
if (-not $SkipDesktopShortcut) {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  STEP 5: CREATING DESKTOP SHORTCUT" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    
    $shortcutScript = Join-Path $projectRoot "scripts" "create-desktop-shortcut.ps1"
    if (Test-Path $shortcutScript) {
        & $shortcutScript -Mode $(if ($BuildProduction) { "production" } else { "dev" })
    } else {
        Write-Host "   ⚠️  Shortcut creation script not found" -ForegroundColor Yellow
        Write-Host "      Run: .\scripts\create-desktop-shortcut.ps1 manually" -ForegroundColor Gray
    }
    Write-Host ""
}

# ============================================
# STEP 6: VERIFY INSTALLATION
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 6: VERIFYING INSTALLATION" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Verifying installation..." -ForegroundColor Cyan

# Check node_modules
if (Test-Path "node_modules") {
    Write-Host "   ✅ Frontend dependencies: installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend dependencies: missing" -ForegroundColor Red
}

# Check server node_modules
if (Test-Path "server\node_modules") {
    Write-Host "   ✅ Backend dependencies: installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend dependencies: missing (run 'npm run server:install')" -ForegroundColor Yellow
}

# Check .env
if (Test-Path ".env") {
    Write-Host "   ✅ Environment file: found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Environment file: missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Installation verification complete!" -ForegroundColor Green
Write-Host ""

# ============================================
# COMPLETE
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run: npm run dev (for development)" -ForegroundColor White
Write-Host "   2. Or: npm run tauri:dev (for desktop app)" -ForegroundColor White
Write-Host "   3. Or: Double-click desktop shortcut (if created)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentation: See README.md for more information" -ForegroundColor Gray
Write-Host ""
