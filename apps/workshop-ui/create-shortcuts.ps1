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

# Desktop Shortcut
$desktopShortcut = $WScriptShell.CreateShortcut("$desktopPath\REFORGE OS.lnk")
$desktopShortcut.TargetPath = "powershell.exe"
$desktopShortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$workshopUiPath\launch-reforge-os.ps1`""
$desktopShortcut.WorkingDirectory = $workshopUiPath
$desktopShortcut.Description = "REFORGE OS - Professional Repair Platform"
$desktopShortcut.IconLocation = "$workshopUiPath\src-tauri\icons\icon.ico"
$desktopShortcut.Save()

Write-Host "Desktop shortcut created: $desktopPath\REFORGE OS.lnk" -ForegroundColor Green

# Start Menu Shortcut
$startMenuShortcut = $WScriptShell.CreateShortcut("$programsPath\REFORGE OS.lnk")
$startMenuShortcut.TargetPath = "powershell.exe"
$startMenuShortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$workshopUiPath\launch-reforge-os.ps1`""
$startMenuShortcut.WorkingDirectory = $workshopUiPath
$startMenuShortcut.Description = "REFORGE OS - Professional Repair Platform"
$startMenuShortcut.IconLocation = "$workshopUiPath\src-tauri\icons\icon.ico"
$startMenuShortcut.Save()

Write-Host "Start Menu shortcut created: $programsPath\REFORGE OS.lnk" -ForegroundColor Green

Write-Host "`nShortcuts created successfully!" -ForegroundColor Green
Write-Host "You can now launch REFORGE OS from:" -ForegroundColor Cyan
Write-Host "  - Desktop: REFORGE OS.lnk" -ForegroundColor Yellow
Write-Host "  - Start Menu > Programs > REFORGE OS" -ForegroundColor Yellow
