# Rebuild Application and Create Desktop Shortcut
# Creates "Bobby's Secret Rooms 1.0" desktop shortcut

$ErrorActionPreference = "Stop"

# Navigate to project directory
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nestedDir = Join-Path $projectRoot "Bobbys-Workshop--3.0.0"

if (-not (Test-Path $nestedDir)) {
    Write-Host "❌ Project directory not found: $nestedDir" -ForegroundColor Red
    exit 1
}

Set-Location $nestedDir

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔨 REBUILDING APPLICATION" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build frontend
Write-Host "📦 Step 1: Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend build complete" -ForegroundColor Green
Write-Host ""

# Step 2: Prepare bundle
Write-Host "📦 Step 2: Preparing bundle..." -ForegroundColor Yellow
npm run prepare:bundle
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Bundle preparation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bundle preparation complete" -ForegroundColor Green
Write-Host ""

# Step 3: Build Tauri
Write-Host "📦 Step 3: Building Tauri application..." -ForegroundColor Yellow
Write-Host "   (This may take 3-5 minutes)" -ForegroundColor Gray
npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tauri build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tauri build complete" -ForegroundColor Green
Write-Host ""

# Step 4: Create desktop shortcut
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🖥️  CREATING DESKTOP SHORTCUT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$exePath = Join-Path (Get-Location) "src-tauri\target\release\bobbys-workshop.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "❌ Executable not found at: $exePath" -ForegroundColor Red
    Write-Host "   Build may have failed or executable is in a different location" -ForegroundColor Yellow
    exit 1
}

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Bobby's Secret Rooms 1.0.lnk"

# Remove existing shortcut if it exists
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "🧹 Removed existing shortcut" -ForegroundColor Yellow
}

try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $exePath
    $shortcut.WorkingDirectory = Split-Path $exePath
    $shortcut.Description = "Bobby's Secret Rooms 1.0 - Device Flashing & Diagnostics"
    $shortcut.IconLocation = $exePath
    $shortcut.WindowStyle = 1  # Normal window
    $shortcut.Save()
    
    # Clean up COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($shortcut) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($WScriptShell) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "   Location: $shortcutPath" -ForegroundColor Gray
    Write-Host ""
    
    # Verify shortcut exists
    if (Test-Path $shortcutPath) {
        Write-Host "✅ Shortcut verified!" -ForegroundColor Green
        Write-Host ""
        
        # Launch application
        Write-Host "🚀 Launching application from desktop shortcut..." -ForegroundColor Cyan
        Start-Process $shortcutPath
        Write-Host "✅ Application launched!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏱️  Please wait 5-10 seconds for backend to start..." -ForegroundColor Yellow
        Write-Host "   Check logs in: $env:LOCALAPPDATA\BobbysWorkshop\logs\" -ForegroundColor Gray
    } else {
        Write-Host "❌ Shortcut creation failed - file not found" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Failed to create shortcut: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ REBUILD AND SHORTCUT CREATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
Write-Host "   ✅ Application rebuilt" -ForegroundColor Green
Write-Host "   ✅ Desktop shortcut created: Bobby's Secret Rooms 1.0" -ForegroundColor Green
Write-Host "   ✅ Application launched" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 You can now use the desktop shortcut anytime!" -ForegroundColor Green
Write-Host ""
