# ============================================
# 🚀 BOBBY'S WORKSHOP - BACKEND SERVER
# ============================================
# Keep this window open!
# This runs the Python FastAPI backend

$ErrorActionPreference = "Stop"

# Set window title
$Host.UI.RawUI.WindowTitle = "🔥 BOBBY'S WORKSHOP - BACKEND (Port 8000)"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 BOBBY'S WORKSHOP - BACKEND SERVER" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot
$env:PYTHONPATH = $projectRoot

Write-Host "📁 Working Directory: $projectRoot" -ForegroundColor Gray
Write-Host "🔧 PYTHONPATH: $projectRoot" -ForegroundColor Gray
Write-Host ""

# Python executable
$pythonExe = Join-Path $projectRoot "backend\venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "❌ ERROR: Python virtual environment not found!" -ForegroundColor Red
    Write-Host "   Run: .\scripts\setup-windows.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "🚀 Starting FastAPI backend on http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API Docs will be at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  KEEP THIS WINDOW OPEN!" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start uvicorn
& $pythonExe -m uvicorn backend.main:app --reload --port 8000 --host 0.0.0.0
