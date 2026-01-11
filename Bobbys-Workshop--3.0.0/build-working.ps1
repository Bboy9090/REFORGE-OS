# Simple Installer Builder for Bobby's Workshop
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "Bobby's Workshop - Simple Installer Builder" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Configuration
$APP_NAME = "BobbysWorkshop"
$VERSION = "1.2.0"
$OUTPUT_DIR = "dist-installer"
$INSTALLER_NAME = "BobbysWorkshop-Setup-v$VERSION.exe"

# Create output directory
Write-Host "Creating output directory..." -ForegroundColor Yellow
if (Test-Path $OUTPUT_DIR) {
    Remove-Item -Recurse -Force $OUTPUT_DIR
}
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

# Copy essential files for portable installation
Write-Host "Copying application files..." -ForegroundColor Yellow

# Copy server (backend)
if (Test-Path "server") {
    Copy-Item -Path "server" -Destination "$OUTPUT_DIR\server" -Recurse -Force
    Write-Host "  Copied server/" -ForegroundColor Green
}

# Copy package.json
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "$OUTPUT_DIR\" -Force
    Write-Host "  Copied package.json" -ForegroundColor Green
}

# Copy README and docs
if (Test-Path "README.md") {
    Copy-Item -Path "README.md" -Destination "$OUTPUT_DIR\" -Force
}

# Copy existing dist if available, otherwise create a basic one
if (Test-Path "dist") {
    Copy-Item -Path "dist" -Destination "$OUTPUT_DIR\dist" -Recurse -Force
    Write-Host "  Copied existing dist/" -ForegroundColor Green
} else {
    Write-Host "  No dist/ found, creating basic frontend..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$OUTPUT_DIR\dist" -Force | Out-Null
    
    # Create a basic index.html
    $basicHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bobby's Workshop</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .logo { font-size: 2.5em; margin-bottom: 20px; color: #00ff88; }
        .status { padding: 20px; background: #333; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #00ff88; color: #000; text-decoration: none; border-radius: 6px; margin: 10px; font-weight: bold; }
        .button:hover { background: #00cc6a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔥 Bobby's Workshop</div>
        <div class="status">
            <h2>Device Management Platform</h2>
            <p>Professional device flashing and diagnostics tool</p>
            <p><strong>Version:</strong> 1.2.0</p>
        </div>
        <a href="http://localhost:3001/api/status" class="button">Check Server Status</a>
        <a href="http://localhost:3001/api/devices" class="button">View Devices</a>
        <div class="status">
            <h3>Server Status</h3>
            <p id="serverStatus">Checking...</p>
        </div>
    </div>
    <script>
        // Check server status
        fetch('/api/status')
            .then(response => response.json())
            .then(data => {
                document.getElementById('serverStatus').innerHTML = 
                    '<span style="color: #00ff88;">✓ Server Running</span><br>' +
                    'Status: ' + (data.status || 'OK') + '<br>' +
                    'Uptime: ' + (data.uptime || 'Unknown');
            })
            .catch(error => {
                document.getElementById('serverStatus').innerHTML = 
                    '<span style="color: #ff4444;">✗ Server Offline</span><br>' +
                    'Please start the server using START.bat';
            });
    </script>
</body>
</html>
"@
    Set-Content -Path "$OUTPUT_DIR\dist\index.html" -Value $basicHtml -Encoding UTF8
    Write-Host "  Created basic frontend" -ForegroundColor Green
}

# Create installer script
Write-Host "Creating installer script..." -ForegroundColor Yellow

$installerScript = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Installer
echo ==========================================
echo.
echo Installing Bobby's Workshop...
echo.

REM Create installation directory
set INSTALL_DIR=%LOCALAPPDATA%\BobbysWorkshop
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy files
echo Copying files...
xcopy /E /I /Y /Q "%~dp0dist" "%INSTALL_DIR%\dist"
xcopy /E /I /Y /Q "%~dp0server" "%INSTALL_DIR%\server"
copy /Y "%~dp0package.json" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0README.md" "%INSTALL_DIR%\" >nul 2>nul
copy /Y "%~dp0START.bat" "%INSTALL_DIR%\" >nul

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Bobby''s Workshop.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\START.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'Bobby''s Workshop - Device Management Platform'; $Shortcut.Save()"

REM Install dependencies
echo.
echo Installing dependencies...
cd /d "%INSTALL_DIR%"
call npm install --production

REM Install server dependencies
cd /d "%INSTALL_DIR%\server"
call npm install --production

cd /d "%INSTALL_DIR%"

echo.
echo ==========================================
echo    Installation Complete!
echo ==========================================
echo.
echo Bobby's Workshop has been installed to:
echo %INSTALL_DIR%
echo.
echo Desktop shortcut created: Bobby's Workshop
echo.
echo To start: Double-click desktop shortcut or run START.bat
echo.
echo Press any key to exit...
pause >nul
'@

Set-Content -Path "$OUTPUT_DIR\INSTALL.bat" -Value $installerScript -Encoding ASCII
Write-Host "  Created INSTALL.bat" -ForegroundColor Green

# Create uninstaller script
$uninstallerScript = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Uninstaller
echo ==========================================
echo.
set /p confirm="Remove Bobby's Workshop? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Removing Bobby's Workshop...

REM Remove installation directory
set INSTALL_DIR=%LOCALAPPDATA%\BobbysWorkshop
if exist "%INSTALL_DIR%" (
    echo Removing installation files...
    rmdir /S /Q "%INSTALL_DIR%"
)

REM Remove desktop shortcut
if exist "%USERPROFILE%\Desktop\Bobby's Workshop.lnk" (
    echo Removing desktop shortcut...
    del "%USERPROFILE%\Desktop\Bobby's Workshop.lnk"
)

echo.
echo ==========================================
echo    Uninstall Complete!
echo ==========================================
echo.
echo Press any key to exit...
pause >nul
'@

Set-Content -Path "$OUTPUT_DIR\UNINSTALL.bat" -Value $uninstallerScript -Encoding ASCII
Write-Host "  Created UNINSTALL.bat" -ForegroundColor Green

# Create launcher script
$startLauncher = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Starting...
echo ==========================================
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Bobby's Workshop...
echo Server will open at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

start "" http://localhost:3001
cd /d "%~dp0server"
node index.js

pause
'@

Set-Content -Path "$OUTPUT_DIR\START.bat" -Value $startLauncher -Encoding ASCII
Write-Host "  Created START.bat" -ForegroundColor Green

# Create portable launcher
$portableLauncher = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Portable Mode
echo ==========================================
echo.
echo Starting in portable mode (no installation)...
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --production
    
    echo Installing server dependencies...
    cd server
    call npm install --production
    cd ..
)

REM Start the application
echo.
echo Starting server...
start "" http://localhost:3001
cd server
node index.js

pause
'@

Set-Content -Path "$OUTPUT_DIR\RUN_PORTABLE.bat" -Value $portableLauncher -Encoding ASCII
Write-Host "  Created RUN_PORTABLE.bat" -ForegroundColor Green

# Create README for installer
$installerReadme = @'
# Bobby's Workshop - Installation Package

## Quick Start

### Option 1: Install (Recommended)
1. Run `INSTALL.bat`
2. Follow the prompts
3. Use desktop shortcut to launch

### Option 2: Portable Mode
1. Run `RUN_PORTABLE.bat`
2. No installation required

## What's Included

- Complete backend server
- Device management APIs
- Web-based interface
- Automatic dependency installation

## Requirements

- Windows 10/11
- Node.js (will prompt to install if missing)

## Installation Location

Default: `%LOCALAPPDATA%\BobbysWorkshop`

## Uninstall

Run `UNINSTALL.bat` to completely remove

## Support

- Check README.md for detailed documentation
- Server runs on http://localhost:3001
- Press Ctrl+C in server window to stop

Version: 1.2.0
'@

Set-Content -Path "$OUTPUT_DIR\README_INSTALLER.md" -Value $installerReadme -Encoding UTF8
Write-Host "  Created README_INSTALLER.md" -ForegroundColor Green

# Create ZIP package
Write-Host "Creating distribution package..." -ForegroundColor Yellow

$zipName = "BobbysWorkshop-Installer-v$VERSION.zip"
Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath $zipName -Force

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created installer package:" -ForegroundColor Cyan
Write-Host "  - $OUTPUT_DIR\ (installer folder)" -ForegroundColor White
Write-Host "  - $zipName (distribution package)" -ForegroundColor White
Write-Host ""
Write-Host "Package contents:" -ForegroundColor Cyan
Write-Host "  ✓ INSTALL.bat (installer)" -ForegroundColor Green
Write-Host "  ✓ UNINSTALL.bat (uninstaller)" -ForegroundColor Green
Write-Host "  ✓ START.bat (launcher)" -ForegroundColor Green
Write-Host "  ✓ RUN_PORTABLE.bat (portable mode)" -ForegroundColor Green
Write-Host "  ✓ server/ (backend)" -ForegroundColor Green
Write-Host "  ✓ dist/ (frontend)" -ForegroundColor Green
Write-Host "  ✓ README_INSTALLER.md (user guide)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test: Run $OUTPUT_DIR\INSTALL.bat" -ForegroundColor White
Write-Host "2. Distribute: Share $zipName" -ForegroundColor White
Write-Host "3. Users can run INSTALL.bat or RUN_PORTABLE.bat" -ForegroundColor White
Write-Host ""
Write-Host "Ready for distribution!" -ForegroundColor Green