# Create Desktop Shortcut for REFORGE OS
# Run this script after building the app to create a desktop shortcut

param(
    [string]$IconPath = "",
    [string]$AppPath = ""
)

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Default paths
if (-not $AppPath) {
    # Check for release build
    $ReleaseExe = Join-Path $ScriptDir "src-tauri\target\release\REFORGE OS.exe"
    $DebugExe = Join-Path $ScriptDir "src-tauri\target\debug\REFORGE OS.exe"
    
    if (Test-Path $ReleaseExe) {
        $AppPath = $ReleaseExe
    } elseif (Test-Path $DebugExe) {
        $AppPath = $DebugExe
    } else {
        Write-Host "Error: REFORGE OS executable not found. Please build the app first." -ForegroundColor Red
        Write-Host "Run: npm run build" -ForegroundColor Yellow
        exit 1
    }
}

# Default icon path
if (-not $IconPath) {
    $IconPath = Join-Path $ScriptDir "src-tauri\icons\icon.ico"
    
    # Check if icon exists, if not use exe icon
    if (-not (Test-Path $IconPath)) {
        $IconPath = $AppPath
    }
}

# Desktop path
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "REFORGE OS.lnk"

Write-Host "Creating desktop shortcut..." -ForegroundColor Green
Write-Host "  App: $AppPath" -ForegroundColor Gray
Write-Host "  Icon: $IconPath" -ForegroundColor Gray
Write-Host "  Shortcut: $ShortcutPath" -ForegroundColor Gray
Write-Host ""

try {
    # Create WScript Shell object
    $WScriptShell = New-Object -ComObject WScript.Shell
    
    # Create shortcut
    $Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $AppPath
    $Shortcut.WorkingDirectory = Split-Path -Parent $AppPath
    $Shortcut.IconLocation = "$IconPath,0"
    $Shortcut.Description = "REFORGE OS - Professional Repair Shop Platform"
    $Shortcut.Save()
    
    Write-Host "✓ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "  Location: $ShortcutPath" -ForegroundColor Cyan
    
    # Also create Start Menu shortcut
    $StartMenuPath = [Environment]::GetFolderPath("StartMenu")
    $ProgramsPath = Join-Path $StartMenuPath "Programs"
    $StartMenuShortcut = Join-Path $ProgramsPath "REFORGE OS.lnk"
    
    $StartMenuShortcutObj = $WScriptShell.CreateShortcut($StartMenuShortcut)
    $StartMenuShortcutObj.TargetPath = $AppPath
    $StartMenuShortcutObj.WorkingDirectory = Split-Path -Parent $AppPath
    $StartMenuShortcutObj.IconLocation = "$IconPath,0"
    $StartMenuShortcutObj.Description = "REFORGE OS - Professional Repair Shop Platform"
    $StartMenuShortcutObj.Save()
    
    Write-Host "✓ Start Menu shortcut created successfully!" -ForegroundColor Green
    Write-Host "  Location: $StartMenuShortcut" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error creating shortcut: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done! You can now launch REFORGE OS from your desktop or Start Menu." -ForegroundColor Green
