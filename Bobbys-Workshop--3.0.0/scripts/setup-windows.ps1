# Bobby's Workshop - Windows Setup Script
# Run this script in PowerShell (as Administrator if needed)

Write-Host "🚀 Setting up Bobby's Workshop..." -ForegroundColor Cyan

# Check Node.js
Write-Host "`n📦 Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Python
Write-Host "`n🐍 Checking Python..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python not found. Please install Python 3.11+ from https://www.python.org/" -ForegroundColor Red
    exit 1
}

# Check FFmpeg
Write-Host "`n🎬 Checking FFmpeg..." -ForegroundColor Yellow
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Write-Host "✅ FFmpeg found" -ForegroundColor Green
} else {
    Write-Host "⚠️  FFmpeg not found. Please install from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    Write-Host "   Add FFmpeg to PATH or place in project root" -ForegroundColor Yellow
}

# Install Frontend Dependencies
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Create Python Virtual Environment
Write-Host "`n🐍 Setting up Python virtual environment..." -ForegroundColor Yellow
if (-Not (Test-Path "backend\venv")) {
    python -m venv backend\venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate and Install Backend Dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
& "backend\venv\Scripts\python.exe" -m pip install --upgrade pip
& "backend\venv\Scripts\pip.exe" install -r backend\requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host "`n⚙️  Setting up environment..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    @"
# Backend
PYTHON_BACKEND_PORT=8000
SECRET_SEQUENCE=PHOENIX_RISES_2025

# Frontend
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host "`n🎉 Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start backend: cd backend && venv\Scripts\activate && uvicorn backend.main:app --reload --port 8000" -ForegroundColor White
Write-Host "   2. Start frontend: npm run dev" -ForegroundColor White
Write-Host "   3. Open browser: http://localhost:5000" -ForegroundColor White
