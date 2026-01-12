# Start REFORGE OS - Launches both backend and frontend

Write-Host "Starting REFORGE OS..." -ForegroundColor Green
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$ApiPath = Join-Path $ProjectRoot "api"
$ExePath = Join-Path $ScriptDir "src-tauri\target\release\workshop-ui.exe"

# Check if executable exists
if (-not (Test-Path $ExePath)) {
    Write-Host "Error: Executable not found. Please build first:" -ForegroundColor Red
    Write-Host "  cd apps/workshop-ui" -ForegroundColor Yellow
    Write-Host "  npm run build" -ForegroundColor Yellow
    exit 1
}

# Start backend API in background
Write-Host "Starting backend API..." -ForegroundColor Yellow
$BackendProcess = Start-Process python -ArgumentList "-m", "uvicorn", "main:app", "--port", "8001", "--host", "127.0.0.1" -WorkingDirectory $ApiPath -PassThru -WindowStyle Hidden

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Test if backend started
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Backend API started successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend may still be starting..." -ForegroundColor Yellow
    Write-Host "  (This is normal, backend will be ready soon)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Starting REFORGE OS..." -ForegroundColor Yellow

# Start frontend
Start-Process -FilePath $ExePath -WorkingDirectory (Split-Path -Parent $ExePath)

Write-Host "✓ REFORGE OS launched!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:8001" -ForegroundColor Cyan
Write-Host "Frontend: Running in REFORGE OS window" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop: Close the app window and backend will stop automatically"
Write-Host "(Or stop backend manually if needed)"

# Store process ID for cleanup if needed
$BackendProcess.Id | Out-File (Join-Path $ScriptDir ".backend-pid.txt") -Encoding ASCII
