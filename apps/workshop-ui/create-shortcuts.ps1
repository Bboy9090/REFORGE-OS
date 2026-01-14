# Create Desktop and Start Menu shortcuts for REFORGE OS

$workshopUiPath = $PSScriptRoot
$desktopPath = [Environment]::GetFolderPath("Desktop")
$startMenuPath = [Environment]::GetFolderPath("StartMenu")
$programsPath = Join-Path $startMenuPath "Programs"

# Create Programs folder if it doesn't exist
if (-not (Test-Path $programsPath)) {
    New-Item -ItemType Directory -Path $programsPath -Force | Out-Null
}

# WScript.Shell for creating shortcuts
$WScriptShell = New-Object -ComObject WScript.Shell

# Try to find the built executable first, otherwise use dev mode
$ReleaseExe = Join-Path $workshopUiPath "src-tauri\target\release\workshop-ui.exe"
$DebugExe = Join-Path $workshopUiPath "src-tauri\target\debug\workshop-ui.exe"
$AppExe = ""

if (Test-Path $ReleaseExe) {
    $AppExe = $ReleaseExe
} elseif (Test-Path $DebugExe) {
    $AppExe = $DebugExe
}

# Desktop Shortcut
$desktopShortcut = $WScriptShell.CreateShortcut("$desktopPath\REFORGE OS.lnk")
if ($AppExe) {
    # Use built executable if available
    $desktopShortcut.TargetPath = $AppExe
    $desktopShortcut.WorkingDirectory = Split-Path -Parent $AppExe
} else {
    # Use dev mode if no executable found
    $desktopShortcut.TargetPath = "powershell.exe"
    $desktopShortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$workshopUiPath\launch-reforge-os.ps1`""
    $desktopShortcut.WorkingDirectory = $workshopUiPath
}
$desktopShortcut.Description = "REFORGE OS - Professional Repair Platform"
$desktopShortcut.IconLocation = "$workshopUiPath\src-tauri\icons\icon.ico"
$desktopShortcut.Save()

Write-Host "Desktop shortcut created: $desktopPath\REFORGE OS.lnk" -ForegroundColor Green

# Start Menu Shortcut
$startMenuShortcut = $WScriptShell.CreateShortcut("$programsPath\REFORGE OS.lnk")
if ($AppExe) {
    # Use built executable if available
    $startMenuShortcut.TargetPath = $AppExe
    $startMenuShortcut.WorkingDirectory = Split-Path -Parent $AppExe
} else {
    # Use dev mode if no executable found
    $startMenuShortcut.TargetPath = "powershell.exe"
    $startMenuShortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$workshopUiPath\launch-reforge-os.ps1`""
    $startMenuShortcut.WorkingDirectory = $workshopUiPath
}
$startMenuShortcut.Description = "REFORGE OS - Professional Repair Platform"
$startMenuShortcut.IconLocation = "$workshopUiPath\src-tauri\icons\icon.ico"
$startMenuShortcut.Save()

Write-Host "Start Menu shortcut created: $programsPath\REFORGE OS.lnk" -ForegroundColor Green

Write-Host "`nShortcuts created successfully!" -ForegroundColor Green
Write-Host "You can now launch REFORGE OS from:" -ForegroundColor Cyan
Write-Host "  - Desktop: REFORGE OS.lnk" -ForegroundColor Yellow
Write-Host "  - Start Menu > Programs > REFORGE OS" -ForegroundColor Yellow
