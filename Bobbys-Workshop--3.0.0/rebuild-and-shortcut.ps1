# Rebuild app and create desktop shortcut
param(
    [string]$AppName = "bobbys secret rooms1.1"
)

$ErrorActionPreference = "Stop"

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔨 REBUILDING APP: $AppName" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Rebuild the app
Write-Host "📦 Building Tauri app..." -ForegroundColor Yellow
npm run tauri:build:windows

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Find the executable
# Tauri might sanitize the name, so check multiple possibilities
$possibleNames = @(
    "bobbyssecretrooms11.exe",
    "bobbys-secret-rooms1.1.exe",
    "bobbys secret rooms1.1.exe",
    "bobbys-workshop.exe"  # Fallback to original
)

$targetDir = Join-Path $projectRoot "src-tauri" "target" "x86_64-pc-windows-msvc" "release"
$appExe = $null

foreach ($name in $possibleNames) {
    $testPath = Join-Path $targetDir $name
    if (Test-Path $testPath) {
        $appExe = $testPath
        Write-Host "✅ Found executable: $name" -ForegroundColor Green
        break
    }
}

# If not found, look for any .exe in release directory
if (-not $appExe) {
    $exeFiles = Get-ChildItem -Path $targetDir -Filter "*.exe" -File | Where-Object { $_.Name -notlike "*deps*" -and $_.Name -notlike "*setup*" -and $_.Name -notlike "*installer*" }
    if ($exeFiles) {
        $appExe = $exeFiles[0].FullName
        Write-Host "✅ Found executable: $($exeFiles[0].Name)" -ForegroundColor Green
    }
}

if (-not $appExe -or -not (Test-Path $appExe)) {
    Write-Host "❌ Executable not found in: $targetDir" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create desktop shortcut
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🖥️  CREATING DESKTOP SHORTCUT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "$AppName.lnk"

# Find icon
$iconPath = Join-Path $projectRoot "src-tauri" "icons" "icon.ico"
if (-not (Test-Path $iconPath)) {
    $iconPath = Join-Path $env:SystemRoot "System32" "shell32.dll"
    $iconIndex = 137
}

Write-Host "📋 Shortcut Configuration:" -ForegroundColor Cyan
Write-Host "   App Name: $AppName" -ForegroundColor Gray
Write-Host "   Target: $appExe" -ForegroundColor Gray
Write-Host "   Desktop: $desktopPath" -ForegroundColor Gray
Write-Host "   Shortcut: $shortcutPath" -ForegroundColor Gray
Write-Host ""

# Remove existing shortcut if it exists
if (Test-Path $shortcutPath) {
    Write-Host "🗑️  Removing existing shortcut..." -ForegroundColor Yellow
    Remove-Item -Path $shortcutPath -Force
}

# Create shortcut
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $appExe
    $Shortcut.WorkingDirectory = Split-Path -Parent $appExe
    $Shortcut.Description = "$AppName - Device Flashing & Diagnostics Tool"
    $Shortcut.WindowStyle = 1  # Normal window
    
    # Set icon
    if (Test-Path $iconPath) {
        if ($iconPath -match "\.ico$") {
            $Shortcut.IconLocation = $iconPath
        } elseif ($iconPath -match "shell32\.dll$") {
            $Shortcut.IconLocation = "$iconPath,$iconIndex"
        } else {
            $Shortcut.IconLocation = "$iconPath,0"
        }
    }
    
    $Shortcut.Save()
    
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "   Location: $shortcutPath" -ForegroundColor Gray
    Write-Host ""
    
    # Clean up COM object
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($Shortcut) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($WshShell) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
} catch {
    Write-Host "❌ Failed to create shortcut: $_" -ForegroundColor Red
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ REBUILD AND SHORTCUT CREATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 App rebuilt and shortcut created!" -ForegroundColor Green
Write-Host "   You can now launch the app from your desktop!" -ForegroundColor Cyan
Write-Host ""

# Step 4: Launch the app
Write-Host "🚀 Launching app from shortcut..." -ForegroundColor Yellow
Start-Process $shortcutPath

Write-Host "✅ App launched!" -ForegroundColor Green
Write-Host ""
