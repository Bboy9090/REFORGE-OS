# Create Desktop Shortcut for Bobby's Workshop Installer
$ErrorActionPreference = "Stop"

Write-Host "Creating desktop shortcut for Bobby's Workshop installer..." -ForegroundColor Cyan

$installerPath = Join-Path $PWD "dist-installer\INSTALL.bat"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Install Bobby's Workshop.lnk"

if (Test-Path $installerPath) {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $installerPath
    $Shortcut.WorkingDirectory = (Split-Path $installerPath -Parent)
    $Shortcut.Description = "Install Bobby's Workshop - Device Management Platform"
    $Shortcut.Save()
    
    Write-Host "Desktop shortcut created: Install Bobby's Workshop" -ForegroundColor Green
    Write-Host "Location: $shortcutPath" -ForegroundColor Gray
} else {
    Write-Host "Installer not found. Run build-clean.ps1 first." -ForegroundColor Red
}

Write-Host ""
Write-Host "You can now:" -ForegroundColor Yellow
Write-Host "1. Double-click the desktop shortcut to install" -ForegroundColor White
Write-Host "2. Or share the ZIP file: BobbysWorkshop-Installer-v1.2.0.zip" -ForegroundColor White