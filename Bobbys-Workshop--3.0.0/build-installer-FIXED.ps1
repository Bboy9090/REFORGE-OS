# ðŸ”¥ Bobby's Workshop - Standalone EXE Builder
# Creates a single .exe installer with everything bundled

# Configuration
$APP_NAME = "BobbysWorkshop"
$VERSION = "1.0.0"
$OUTPUT_DIR = "dist-installer"
$INSTALLER_NAME = "BobbysWorkshop-Setup-v$VERSION.exe"

Write-Host "ðŸ”¥ Bobby's Workshop - Standalone EXE Builder" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check for required tools
$needsTools = @()

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $needsTools += "Node.js"
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    $needsTools += "npm"
}

if ($needsTools.Count -gt 0) {
    Write-Host "âŒ Missing required tools: $($needsTools -join ', ')" -ForegroundColor Red
    Write-Host "Install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "âœ… Node.js and npm found" -ForegroundColor Green
Write-Host ""

# Step 1: Build the frontend
Write-Host "ðŸ“¦ Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "âŒ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "âœ… Frontend built" -ForegroundColor Green
Write-Host ""

# Step 2: Create output directory
Write-Host "ðŸ”§ Creating output directory..." -ForegroundColor Yellow
if (Test-Path $OUTPUT_DIR) {
    Remove-Item -Recurse -Force $OUTPUT_DIR
}
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
Write-Host "âœ… Output directory created" -ForegroundColor Green
Write-Host ""

# Step 3: Copy files
Write-Host "ðŸ“ Copying files..." -ForegroundColor Yellow

# Copy built frontend
if (Test-Path "dist") {
    Copy-Item -Path "dist" -Destination "$OUTPUT_DIR\dist" -Recurse -Force
}

# Copy server
if (Test-Path "server") {
    Copy-Item -Path "server" -Destination "$OUTPUT_DIR\server" -Recurse -Force
}

# Copy data directory if exists
if (Test-Path "data") {
    Copy-Item -Path "data" -Destination "$OUTPUT_DIR\data" -Recurse -Force
}

# Copy package files
Copy-Item -Path "package.json" -Destination "$OUTPUT_DIR\" -Force
Copy-Item -Path "README.md" -Destination "$OUTPUT_DIR\" -Force -ErrorAction SilentlyContinue

Write-Host "âœ… Files copied" -ForegroundColor Green
Write-Host ""

# Step 4: Create installer script
Write-Host "ðŸ“ Creating installer script..." -ForegroundColor Yellow

$installerScript = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Universal Installer
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
xcopy /E /I /Y /Q "%~dp0data" "%INSTALL_DIR%\data" 2>nul
copy /Y "%~dp0package.json" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0README.md" "%INSTALL_DIR%\" >nul 2>nul
copy /Y "%~dp0START.bat" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0install.ps1" "%INSTALL_DIR%\" >nul

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "\$WshShell = New-Object -comObject WScript.Shell; \$Shortcut = \$WshShell.CreateShortcut('%USERPROFILE%\Desktop\Bobby''s Workshop.lnk'); \$Shortcut.TargetPath = '%INSTALL_DIR%\START.bat'; \$Shortcut.WorkingDirectory = '%INSTALL_DIR%'; \$Shortcut.Description = 'Bobby''s Workshop - Device Management Platform'; \$Shortcut.Save()"

REM Create start menu shortcut
echo Creating start menu shortcut...
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs
if not exist "%START_MENU%\Bobby's Workshop" mkdir "%START_MENU%\Bobby's Workshop"
powershell -Command "\$WshShell = New-Object -comObject WScript.Shell; \$Shortcut = \$WshShell.CreateShortcut('%START_MENU%\Bobby''s Workshop\Bobby''s Workshop.lnk'); \$Shortcut.TargetPath = '%INSTALL_DIR%\START.bat'; \$Shortcut.WorkingDirectory = '%INSTALL_DIR%'; \$Shortcut.Description = 'Bobby''s Workshop - Device Management Platform'; \$Shortcut.Save()"

REM Install Node.js dependencies
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
Write-Host "Created INSTALL.bat" -ForegroundColor Green

# Step 5: Create uninstaller script
Write-Host "ðŸ“ Creating uninstaller script..." -ForegroundColor Yellow

$uninstallerScript = @'
@echo off
cls
echo ==========================================
echo    Bobby's Workshop - Uninstaller
echo ==========================================
echo.
echo This will remove Bobby's Workshop from your computer.
echo.
set /p confirm="Are you sure? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Uninstall cancelled.
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

REM Remove start menu shortcuts
set START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Bobby's Workshop
if exist "%START_MENU%" (
    echo Removing start menu shortcuts...
    rmdir /S /Q "%START_MENU%"
)

echo.
echo ==========================================
echo    Uninstall Complete!
echo ==========================================
echo.
echo Bobby's Workshop has been removed from your computer.
echo.
echo Press any key to exit...
pause >nul
'@

Set-Content -Path "$OUTPUT_DIR\UNINSTALL.bat" -Value $uninstallerScript -Encoding ASCII
Write-Host "âœ… UNINSTALL.bat created" -ForegroundColor Green

# Step 6: Create portable launcher
Write-Host "ðŸ“ Creating portable launcher..." -ForegroundColor Yellow

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
Write-Host "Created RUN_PORTABLE.bat" -ForegroundColor Green

# Step 7: Create START.bat launcher
Write-Host "Creating START.bat launcher..." -ForegroundColor Yellow

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
Write-Host "Created START.bat" -ForegroundColor Green

# Step 8: Copy install.ps1 from root
Write-Host "Copying install.ps1..." -ForegroundColor Yellow
if (Test-Path "install.ps1") {
    Copy-Item -Path "install.ps1" -Destination "$OUTPUT_DIR\" -Force
    Write-Host "install.ps1 copied" -ForegroundColor Green
} else {
    Write-Host "install.ps1 not found in root" -ForegroundColor Yellow
}

# Step 9: Create installer README
Write-Host "Creating installer README..." -ForegroundColor Yellow

$installerReadme = @'
# Bobby's Workshop - Standalone Installer

## What's Included

This installer contains everything you need to run Bobby's Workshop:

- Complete web application (frontend + backend)
- All server APIs and routes
- Device management tools
- âœ… Firmware library
- âœ… Automation framework
- âœ… All features unlocked!

## ðŸš€ Installation

### Step 1: Run Installer

Double-click `INSTALL.bat` and follow the prompts.

### Step 2: Install System Tools

1. Right-click PowerShell and "Run as Administrator"
2. Navigate to installation folder: ``cd %LOCALAPPDATA%\BobbysWorkshop``
3. Run: ``.\install.ps1``
4. This installs: adb, scrcpy, ffmpeg, and other required tools

### Step 3: Start Bobby's Workshop

**Option 1:** Double-click "Bobby's Workshop" on your desktop

**Option 2:** Start Menu â†’ Bobby's Workshop

**Option 3:** Run ``START.bat`` in the installation folder

The application will open in your browser at: http://localhost:3001

## ðŸ“ Installation Location

Default: ``%LOCALAPPDATA%\BobbysWorkshop``

Typically: ``C:\Users\YourName\AppData\Local\BobbysWorkshop``

## ðŸ—‘ï¸ Uninstallation

Run ``UNINSTALL.bat`` to completely remove Bobby's Workshop

## ðŸ”§ What Gets Installed

### Frontend (dist/)
- React-based web UI
- All components and styles
- Static assets

### Backend (server/)
- Express.js API server
- Device detection APIs
- Flash operation APIs
- Firmware library
- Authorization triggers
- WebSocket services

### System Tools (via install.ps1)
- Android Platform Tools (adb, fastboot)
- scrcpy (Android screen mirror)
- FFmpeg (media conversion)
- Additional utilities

## âœ… Features

### Device Management
- âœ… Android device detection (ADB/Fastboot)
- âœ… iOS device detection (libimobiledevice)
- âœ… USB device correlation
- âœ… Real-time device monitoring

### Android Features
- âœ… Screen mirroring (scrcpy)
- âœ… ADB shell access
- âœ… Fastboot operations
- âœ… Recovery mode access
- âœ… Bootloader operations

### iOS Features
- âœ… Device backup/restore
- âœ… DFU mode detection
- âœ… Recovery mode access
- âœ… Firmware restore

### Firmware Library
- âœ… Apple IPSW downloads
- âœ… Firmware version checking
- âœ… Direct download integration
- âœ… Firmware validation

### Media Studio
- âœ… Video conversion (FFmpeg)
- âœ… Audio extraction
- âœ… GIF creation
- âœ… Batch processing

### Debloater
- âœ… 53 common bloatware apps
- âœ… Safe removal
- âœ… Batch uninstall
- âœ… Backup before removal

### Developer Tools
- âœ… Authorization triggers (27 endpoints)
- âœ… Secure operations API
- âœ… Audit logging
- âœ… RBAC system

## ðŸŽ® Portable Mode

Don't want to install? Use portable mode!

1. Extract this folder anywhere (USB drive, Desktop, etc.)
2. Run ``RUN_PORTABLE.bat``
3. No installation required!

## ðŸ”§ Troubleshooting

### Server won't start
- Check Node.js is installed: ``node --version``
- Check port 3001 is not in use
- Run ``npm install`` in both root and server folders

### Tools not found
- Run ``install.ps1`` as Administrator
- Add tools to PATH manually
- Check ANDROID_HOME environment variable

### Need help?
- Check QUICK_START.md in installation folder
- View README.md for detailed documentation

## ðŸŽ‰ Enjoy Bobby's Workshop!

You now have a complete, professional device management platform!

**Version:** 1.0.0
**Platform:** Windows 10/11
**License:** MIT
'@

Set-Content -Path "$OUTPUT_DIR\INSTALLER_README.md" -Value $installerReadme -Encoding UTF8
Write-Host "âœ… INSTALLER_README.md created" -ForegroundColor Green
Write-Host ""

# Step 10: Package installer
Write-Host "ðŸ“¦ Creating distribution package..." -ForegroundColor Yellow

$sevenZip = $null
$sevenZipPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe",
    "$env:ProgramFiles\7-Zip\7z.exe",
    "${env:ProgramFiles(x86)}\7-Zip\7z.exe"
)

foreach ($path in $sevenZipPaths) {
    if (Test-Path $path) {
        $sevenZip = $path
        break
    }
}

if ($sevenZip) {
    Write-Host "7-Zip found, creating self-extracting EXE..." -ForegroundColor Green
    
    & $sevenZip a -sfx7z.sfx "$INSTALLER_NAME" "$OUTPUT_DIR\*" -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "âœ… Self-extracting EXE created: $INSTALLER_NAME" -ForegroundColor Green
    } else {
        Write-Host "âš ï¸  7-Zip packaging failed, creating ZIP instead..." -ForegroundColor Yellow
        Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath "BobbysWorkshop-Portable-v$VERSION.zip" -Force
        Write-Host "âœ… ZIP package created: BobbysWorkshop-Portable-v$VERSION.zip" -ForegroundColor Green
    }
} else {
    Write-Host "7-Zip not found, creating ZIP package..." -ForegroundColor Yellow
    Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath "BobbysWorkshop-Portable-v$VERSION.zip" -Force
    Write-Host "âœ… ZIP package created: BobbysWorkshop-Portable-v$VERSION.zip" -ForegroundColor Green
    Write-Host "" -ForegroundColor Yellow
    Write-Host "ðŸ’¡ Install 7-Zip to create self-extracting .exe installer" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.7-zip.org/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "âœ… BUILD COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ðŸ“¦ Distribution files created:" -ForegroundColor Cyan
Write-Host "   - $OUTPUT_DIR\ (installer folder)" -ForegroundColor White
Write-Host "   - BobbysWorkshop-Portable-v$VERSION.zip (portable package)" -ForegroundColor White
Write-Host ""
Write-Host "ðŸ“‹ Files included:" -ForegroundColor Cyan
Write-Host "   âœ… INSTALL.bat (installer)" -ForegroundColor Green
Write-Host "   âœ… UNINSTALL.bat (uninstaller)" -ForegroundColor Green
Write-Host "   âœ… RUN_PORTABLE.bat (portable mode)" -ForegroundColor Green
Write-Host "   âœ… START.bat (launcher)" -ForegroundColor Green
Write-Host "   âœ… install.ps1 (system tools installer)" -ForegroundColor Green
Write-Host "   âœ… dist/ (built frontend)" -ForegroundColor Green
Write-Host "   âœ… server/ (backend)" -ForegroundColor Green
Write-Host "   âœ… INSTALLER_README.md (user guide)" -ForegroundColor Green
Write-Host ""
Write-Host "ðŸŽ Ready to distribute!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test: Run $OUTPUT_DIR\INSTALL.bat" -ForegroundColor White
Write-Host "2. Share: Upload BobbysWorkshop-Portable-v$VERSION.zip" -ForegroundColor White
Write-Host "3. Or create EXE: Install 7-Zip and run script again" -ForegroundColor White
Write-Host ""

