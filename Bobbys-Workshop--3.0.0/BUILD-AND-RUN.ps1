# ============================================
# 🔥 BOBBY'S WORKSHOP - MASTER BUILD & RUN
# ============================================
# Complete setup, build, and run script
# This script does EVERYTHING in the correct order

$ErrorActionPreference = "Stop"

# Set window title
$Host.UI.RawUI.WindowTitle = "🔥 BOBBY'S WORKSHOP - BUILD & RUN"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 BOBBY'S WORKSHOP - MASTER BUILD & RUN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot
Write-Host "📁 Project Root: $projectRoot" -ForegroundColor Gray
Write-Host ""

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
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found! Install Node.js 18+ first." -ForegroundColor Red
    $checksPassed = $false
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found!" -ForegroundColor Red
    $checksPassed = $false
}

# Check Python
Write-Host "🔍 Checking Python..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found! Install Python 3.11+ first." -ForegroundColor Red
    $checksPassed = $false
}

# Check FFmpeg (optional but recommended)
Write-Host "🔍 Checking FFmpeg (optional)..." -ForegroundColor Cyan
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "   ✅ FFmpeg: Installed" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  FFmpeg not found (optional, but recommended for audio processing)" -ForegroundColor Yellow
}

if (-not $checksPassed) {
    Write-Host ""
    Write-Host "❌ Prerequisites check failed! Please install missing tools first." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "✅ All prerequisites met!" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: CREATE .env FILE
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 2: SETTING UP ENVIRONMENT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$envFile = Join-Path $projectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Cyan
    @"
# Bobby's Workshop - Environment Configuration

# Backend (Python FastAPI)
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=PHOENIX_RISES_2025

# Frontend (React/Vite)
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Legacy Backend (Node.js Express) - Optional
VITE_LEGACY_API_URL=http://localhost:3001
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "   ✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "   ✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 3: INSTALL FRONTEND DEPENDENCIES
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 3: INSTALLING FRONTEND DEPENDENCIES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Cyan
    Write-Host "   ℹ️  node_modules found, skipping install (use 'npm install' to update)" -ForegroundColor Gray
} else {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to install frontend dependencies!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 4: SETUP BACKEND VIRTUAL ENVIRONMENT
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 4: SETTING UP BACKEND VIRTUAL ENVIRONMENT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$backendDir = Join-Path $projectRoot "backend"
$venvDir = Join-Path $backendDir "venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

if (-not (Test-Path $venvDir)) {
    Write-Host "🐍 Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv $venvDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Failed to create virtual environment!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "   ✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "   ✅ Virtual environment already exists" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 5: INSTALL BACKEND DEPENDENCIES
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 5: INSTALLING BACKEND DEPENDENCIES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$requirementsFile = Join-Path $backendDir "requirements.txt"
if (-not (Test-Path $requirementsFile)) {
    Write-Host "   ⚠️  requirements.txt not found, skipping..." -ForegroundColor Yellow
} else {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
    Write-Host "   This may take a few minutes (installing numpy, scipy, librosa, etc.)..." -ForegroundColor Gray
    
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r $requirementsFile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Some dependencies may have failed. Continuing anyway..." -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================
# STEP 6: BUILD FRONTEND (OPTIONAL)
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 6: BUILDING FRONTEND (OPTIONAL)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$buildChoice = Read-Host "Build frontend for production? (y/N)"
if ($buildChoice -eq "y" -or $buildChoice -eq "Y") {
    Write-Host "🏗️  Building frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Build failed!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "   ✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "   ⏭️  Skipping production build (will run in dev mode)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# STEP 7: VERIFY SETUP
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 7: VERIFYING SETUP" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔍 Verifying installation..." -ForegroundColor Cyan

# Check if backend Python is accessible
if (Test-Path $venvPython) {
    Write-Host "   ✅ Backend Python executable found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend Python executable not found!" -ForegroundColor Red
    $checksPassed = $false
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "   ✅ Frontend node_modules found" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend node_modules not found!" -ForegroundColor Red
    $checksPassed = $false
}

if (-not $checksPassed) {
    Write-Host ""
    Write-Host "❌ Verification failed! Please check errors above." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "✅ All verifications passed!" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 8: ASK TO START SERVERS
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 8: READY TO START SERVERS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Setup complete! Ready to start servers." -ForegroundColor Green
Write-Host ""
Write-Host "📋 What happens next:" -ForegroundColor Cyan
Write-Host "   1. Backend will start on: http://localhost:8000" -ForegroundColor White
Write-Host "   2. Frontend will start on: http://localhost:5000" -ForegroundColor White
Write-Host "   3. API Docs will be at: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  This will open 2 new PowerShell windows (one for backend, one for frontend)" -ForegroundColor Yellow
Write-Host ""

$startChoice = Read-Host "Start servers now? (Y/n)"
if ($startChoice -ne "n" -and $startChoice -ne "N") {
    Write-Host ""
    Write-Host "🚀 Starting servers..." -ForegroundColor Green
    Write-Host ""
    
    # Start backend in new window
    $backendScript = Join-Path $projectRoot "START-BACKEND.ps1"
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend in new window
    $frontendScript = Join-Path $projectRoot "START-FRONTEND.ps1"
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""
    
    Write-Host "✅ Servers starting in separate windows!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Once servers are ready, open:" -ForegroundColor Cyan
    Write-Host "   http://localhost:5000" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Phoenix Key: PHOENIX_RISES_2025" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⏭️  Skipping server start." -ForegroundColor Gray
    Write-Host "   Run START-BACKEND.ps1 and START-FRONTEND.ps1 manually when ready." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ BUILD & SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

pause
