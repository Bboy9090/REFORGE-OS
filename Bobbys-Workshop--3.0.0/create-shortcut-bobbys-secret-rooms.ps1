# Create Desktop Shortcut for "Bobby's Secret Rooms 1.0"
# This script creates a desktop shortcut pointing to the built Tauri executable

$ErrorActionPreference = "Stop"

# Get project root (where this script is located)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$nestedProject = Join-Path $projectRoot "Bobbys-Workshop--3.0.0"

# Find executable
$exePath = Join-Path $nestedProject "src-tauri\target\release\bobbys-workshop.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "❌ Executable not found at: $exePath" -ForegroundColor Red
    Write-Host "   Please rebuild the application first!" -ForegroundColor Yellow
    exit 1
}

# Desktop shortcut path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Bobby's Secret Rooms 1.0.lnk"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🖥️  CREATING DESKTOP SHORTCUT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Executable: $exePath" -ForegroundColor Gray
Write-Host "   Desktop: $desktopPath" -ForegroundColor Gray
Write-Host "   Shortcut: $shortcutPath" -ForegroundColor Gray
Write-Host ""

# Remove existing shortcut if it exists
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "🧹 Removed existing shortcut" -ForegroundColor Yellow
}

try {
    # Create shortcut using COM object
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $exePath
    $shortcut.WorkingDirectory = Split-Path $exePath
    $shortcut.Description = "Bobby's Secret Rooms 1.0 - Device Flashing & Diagnostics"
    $shortcut.IconLocation = $exePath
    $shortcut.WindowStyle = 1  # Normal window (1 = Normal, 7 = Minimized)
    $shortcut.Save()
    
    # Clean up COM objects
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($shortcut) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($WScriptShell) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "   Location: $shortcutPath" -ForegroundColor Gray
    Write-Host ""
    
    # Verify shortcut
    if (Test-Path $shortcutPath) {
        Write-Host "✅ Shortcut verified!" -ForegroundColor Green
        Write-Host ""
        
        # Launch application
        Write-Host "🚀 Launching application..." -ForegroundColor Cyan
        Start-Process $shortcutPath
        Write-Host "✅ Application launched from desktop shortcut!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏱️  Please wait 5-10 seconds for backend to start..." -ForegroundColor Yellow
        Write-Host "   Check logs in: $env:LOCALAPPDATA\BobbysWorkshop\logs\" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "❌ Shortcut verification failed!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Failed to create shortcut: $_" -ForegroundColor Red
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ SHORTCUT CREATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 You can now launch 'Bobby's Secret Rooms 1.0' from your desktop!" -ForegroundColor Green
Write-Host ""
