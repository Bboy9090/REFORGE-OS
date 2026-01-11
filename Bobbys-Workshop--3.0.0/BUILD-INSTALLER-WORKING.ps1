# Bobby's Workshop - Complete Installer Builder
# This script builds a standalone installer package

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_NAME = "BobbysWorkshop"
$VERSION = "v1.0.0"
$OUTPUT_DIR = "dist-installer"
$ZIP_NAME = "$PROJECT_NAME-Portable-$VERSION.zip"
$EXE_NAME = "$PROJECT_NAME-Setup-$VERSION.exe"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Bobby's Workshop - Installer Builder" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path $OUTPUT_DIR) {
    Remove-Item -Recurse -Force $OUTPUT_DIR
    Write-Host "Previous build cleaned" -ForegroundColor Green
}

# Step 2: Build the React frontend
Write-Host "Building React frontend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 3: Create installer directory structure
Write-Host "Creating installer structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
New-Item -ItemType Directory -Path "$OUTPUT_DIR\dist" -Force | Out-Null
New-Item -ItemType Directory -Path "$OUTPUT_DIR\server" -Force | Out-Null
Write-Host "Directory structure created" -ForegroundColor Green

# Step 4: Copy built files
Write-Host "Copying built frontend..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination "$OUTPUT_DIR\dist\" -Recurse -Force
Write-Host "Frontend copied" -ForegroundColor Green

Write-Host "Copying server files..." -ForegroundColor Yellow
$serverFiles = @(
    "server\index.js",
    "server\package.json",
    "server\authorization-triggers.js",
    "server\platform-tools.js"
)

foreach ($file in $serverFiles) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$OUTPUT_DIR\server\" -Force
    }
}
Write-Host "Server files copied" -ForegroundColor Green

# Copy server subdirectories if they exist
if (Test-Path "server\core") {
    Copy-Item -Path "server\core" -Destination "$OUTPUT_DIR\server\" -Recurse -Force
}
if (Test-Path "server\routes") {
    Copy-Item -Path "server\routes" -Destination "$OUTPUT_DIR\server\" -Recurse -Force
}
if (Test-Path "server\middleware") {
    Copy-Item -Path "server\middleware" -Destination "$OUTPUT_DIR\server\" -Recurse -Force
}
if (Test-Path "server\runtime") {
    Copy-Item -Path "server\runtime" -Destination "$OUTPUT_DIR\server\" -Recurse -Force
}

# Step 5: Create INSTALL.bat
Write-Host "Creating INSTALL.bat..." -ForegroundColor Yellow

$installerScript = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Installer
echo ==========================================
echo.
echo Installing to: %LOCALAPPDATA%\BobbysWorkshop
echo.

set INSTALL_DIR=%LOCALAPPDATA%\BobbysWorkshop

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copying files...
xcopy /E /I /Y /Q "%~dp0\*" "%INSTALL_DIR%\"

echo.
echo Creating shortcuts...

REM Desktop shortcut
set DESKTOP=%USERPROFILE%\Desktop
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%DESKTOP%\Bobby's Workshop.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\START.bat" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "Bobby's Workshop - Device Management Tool" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"
cscript /nologo "%TEMP%\CreateShortcut.vbs"
del "%TEMP%\CreateShortcut.vbs"

REM Start Menu shortcut
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
if not exist "%START_MENU%\Bobby's Workshop" mkdir "%START_MENU%\Bobby's Workshop"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%START_MENU%\Bobby's Workshop\Bobby's Workshop.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%INSTALL_DIR%\START.bat" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "Bobby's Workshop" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"
cscript /nologo "%TEMP%\CreateShortcut.vbs"
del "%TEMP%\CreateShortcut.vbs"

echo.
echo ==========================================
echo    Installation Complete!
echo ==========================================
echo.
echo Shortcuts created:
echo   - Desktop: Bobby's Workshop
echo   - Start Menu: Bobby's Workshop
echo.
echo Next steps:
echo 1. Run install.ps1 to install system tools
echo 2. Double-click desktop shortcut to launch
echo.
echo Press any key to exit...
pause >nul
'@

Set-Content -Path "$OUTPUT_DIR\INSTALL.bat" -Value $installerScript -Encoding ASCII
Write-Host "INSTALL.bat created" -ForegroundColor Green

# Step 6: Create RUN_PORTABLE.bat
Write-Host "Creating RUN_PORTABLE.bat..." -ForegroundColor Yellow

$portableLauncher = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Portable Mode
echo ==========================================
echo.
echo Starting Bobby's Workshop in portable mode...
echo (No installation required)
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
Write-Host "RUN_PORTABLE.bat created" -ForegroundColor Green

# Step 7: Create START.bat
Write-Host "Creating START.bat..." -ForegroundColor Yellow

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
Write-Host "START.bat created" -ForegroundColor Green

# Step 8: Copy install.ps1
Write-Host "Copying install.ps1..." -ForegroundColor Yellow
if (Test-Path "install.ps1") {
    Copy-Item -Path "install.ps1" -Destination "$OUTPUT_DIR\" -Force
    Write-Host "install.ps1 copied" -ForegroundColor Green
} else {
    Write-Host "install.ps1 not found" -ForegroundColor Yellow
}

# Step 9: Create README
Write-Host "Creating README..." -ForegroundColor Yellow

$readme = @'
# Bobby's Workshop - Standalone Installer

## Installation

1. Run INSTALL.bat
2. Run install.ps1 (as Administrator) to install system tools
3. Launch from desktop shortcut

## Portable Mode

No installation needed! Just run RUN_PORTABLE.bat

## Features

- Device Management (Android/iOS)
- Screen Mirroring (scrcpy)
- Firmware Library
- Media Studio
- Debloater
- All features unlocked!

## Requirements

- Windows 10/11
- Node.js 18+
- Optional: Android SDK Platform Tools

'@

Set-Content -Path "$OUTPUT_DIR\README.txt" -Value $readme -Encoding ASCII
Write-Host "README created" -ForegroundColor Green

# Step 10: Create ZIP package
Write-Host "Creating ZIP package..." -ForegroundColor Yellow
if (Test-Path $ZIP_NAME) {
    Remove-Item $ZIP_NAME -Force
}

try {
    Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath $ZIP_NAME -Force
    Write-Host "ZIP package created: $ZIP_NAME" -ForegroundColor Green
} catch {
    Write-Host "ERROR creating ZIP" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Final summary
Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "   BUILD COMPLETE!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output files:" -ForegroundColor Cyan
Write-Host "  - $OUTPUT_DIR/   (installer files)" -ForegroundColor White
Write-Host "  - $ZIP_NAME   (portable package)" -ForegroundColor White
Write-Host ""
Write-Host "To distribute:" -ForegroundColor Yellow
Write-Host "  1. Share $ZIP_NAME with users" -ForegroundColor White
Write-Host "  2. Users extract and run INSTALL.bat" -ForegroundColor White
Write-Host "  3. Or run RUN_PORTABLE.bat for no-install mode" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
