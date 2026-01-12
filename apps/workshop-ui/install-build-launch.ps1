# Install, Build, and Launch REFORGE OS (Tauri App)

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   REFORGE OS - Install, Build & Launch                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Step 1: Install Dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: npm install failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ npm packages installed" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules already exists" -ForegroundColor Green
}

Write-Host ""

# Step 2: Build the Application
Write-Host "Step 2: Building application..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Gray
Write-Host ""

# Build frontend first (Vite)
Write-Host "Building frontend (Vite)..." -ForegroundColor Gray
npm run vite:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green
Write-Host ""

# Build Tauri app
Write-Host "Building Tauri app (Rust)..." -ForegroundColor Gray
Write-Host "This will compile Rust code - please wait..." -ForegroundColor Gray
npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Tauri build failed" -ForegroundColor Red
    Write-Host "Trying direct cargo build instead..." -ForegroundColor Yellow
    cd src-tauri
    cargo build --release
    cd ..
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Build failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Tauri app built successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Locate Executable
Write-Host "Step 3: Locating executable..." -ForegroundColor Yellow
$ExePath = Join-Path $ScriptDir "src-tauri\target\release\workshop-ui.exe"
if (-not (Test-Path $ExePath)) {
    Write-Host "Error: Executable not found at: $ExePath" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Executable found: workshop-ui.exe" -ForegroundColor Green
Write-Host ""

# Step 4: Launch Application
Write-Host "Step 4: Launching REFORGE OS..." -ForegroundColor Yellow
Write-Host ""

# Start backend API first (in background)
$ProjectRoot = Split-Path -Parent $ScriptDir
$ApiPath = Join-Path $ProjectRoot "api"

if (Test-Path $ApiPath) {
    Write-Host "Starting backend API..." -ForegroundColor Gray
    $BackendProcess = Start-Process python -ArgumentList "-m", "uvicorn", "main:app", "--port", "8001", "--host", "127.0.0.1" -WorkingDirectory $ApiPath -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 2
    Write-Host "✓ Backend API started" -ForegroundColor Green
    Write-Host ""
}

# Launch frontend
Write-Host "Launching REFORGE OS window..." -ForegroundColor Gray
Start-Process -FilePath $ExePath -WorkingDirectory (Split-Path -Parent $ExePath)
Write-Host "✓ REFORGE OS launched!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Installation Complete!                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host "✓ Application built" -ForegroundColor Green
Write-Host "✓ Backend API started (port 8001)" -ForegroundColor Green
Write-Host "✓ REFORGE OS launched" -ForegroundColor Green
Write-Host ""
Write-Host "The REFORGE OS window should open shortly." -ForegroundColor Cyan
Write-Host ""
Write-Host "To launch again later:" -ForegroundColor Yellow
Write-Host "  Desktop shortcut: REFORGE OS" -ForegroundColor Gray
Write-Host "  Or run: .\src-tauri\target\release\workshop-ui.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: Backend API must be running for the app to work." -ForegroundColor Yellow
Write-Host "Start backend with: cd api ; python -m uvicorn main:app --port 8001" -ForegroundColor Gray
