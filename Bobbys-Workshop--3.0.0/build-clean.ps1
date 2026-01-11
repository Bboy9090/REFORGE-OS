# Simple Installer Builder for Bobby's Workshop
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

Write-Host "Bobby's Workshop - Simple Installer Builder" -ForegroundColor Cyan

# Configuration
$APP_NAME = "BobbysWorkshop"
$VERSION = "1.2.0"
$OUTPUT_DIR = "dist-installer"

# Create output directory
Write-Host "Creating output directory..." -ForegroundColor Yellow
if (Test-Path $OUTPUT_DIR) {
    Remove-Item -Recurse -Force $OUTPUT_DIR
}
New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null

# Copy essential files
Write-Host "Copying application files..." -ForegroundColor Yellow

# Copy server
if (Test-Path "server") {
    Copy-Item -Path "server" -Destination "$OUTPUT_DIR\server" -Recurse -Force
    Write-Host "  Copied server/" -ForegroundColor Green
}

# Copy package.json
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "$OUTPUT_DIR\" -Force
    Write-Host "  Copied package.json" -ForegroundColor Green
}

# Copy README
if (Test-Path "README.md") {
    Copy-Item -Path "README.md" -Destination "$OUTPUT_DIR\" -Force
}

# Copy or create dist
if (Test-Path "dist") {
    Copy-Item -Path "dist" -Destination "$OUTPUT_DIR\dist" -Recurse -Force
    Write-Host "  Copied existing dist/" -ForegroundColor Green
} else {
    Write-Host "  Creating basic frontend..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "$OUTPUT_DIR\dist" -Force | Out-Null
    
    $basicHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Bobby's Workshop</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: #fff; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .logo { font-size: 2.5em; margin-bottom: 20px; color: #00ff88; }
        .status { padding: 20px; background: #333; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Bobby's Workshop</div>
        <div class="status">
            <h2>Device Management Platform</h2>
            <p>Version: 1.2.0</p>
        </div>
    </div>
</body>
</html>
"@
    Set-Content -Path "$OUTPUT_DIR\dist\index.html" -Value $basicHtml -Encoding UTF8
    Write-Host "  Created basic frontend" -ForegroundColor Green
}

# Create installer script
Write-Host "Creating installer scripts..." -ForegroundColor Yellow

$installerScript = @'
@echo off
cls
echo Installing Bobby's Workshop...

set INSTALL_DIR=%LOCALAPPDATA%\BobbysWorkshop
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copying files...
xcopy /E /I /Y /Q "%~dp0dist" "%INSTALL_DIR%\dist"
xcopy /E /I /Y /Q "%~dp0server" "%INSTALL_DIR%\server"
copy /Y "%~dp0package.json" "%INSTALL_DIR%\" >nul
copy /Y "%~dp0START.bat" "%INSTALL_DIR%\" >nul

echo Installing dependencies...
cd /d "%INSTALL_DIR%"
call npm install --production

cd /d "%INSTALL_DIR%\server"
call npm install --production

echo Installation complete!
echo Location: %INSTALL_DIR%
pause
'@

Set-Content -Path "$OUTPUT_DIR\INSTALL.bat" -Value $installerScript -Encoding ASCII

$startScript = @'
@echo off
cls
echo Starting Bobby's Workshop...

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

echo Server starting at: http://localhost:3001
start "" http://localhost:3001
cd /d "%~dp0server"
node index.js
pause
'@

Set-Content -Path "$OUTPUT_DIR\START.bat" -Value $startScript -Encoding ASCII

$portableScript = @'
@echo off
cls
echo Bobby's Workshop - Portable Mode

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js required
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --production
    cd server
    call npm install --production
    cd ..
)

echo Starting server...
start "" http://localhost:3001
cd server
node index.js
pause
'@

Set-Content -Path "$OUTPUT_DIR\RUN_PORTABLE.bat" -Value $portableScript -Encoding ASCII

# Create ZIP package
Write-Host "Creating ZIP package..." -ForegroundColor Yellow
$zipName = "BobbysWorkshop-Installer-v$VERSION.zip"
Compress-Archive -Path "$OUTPUT_DIR\*" -DestinationPath $zipName -Force

Write-Host ""
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Created:" -ForegroundColor Cyan
Write-Host "  - $OUTPUT_DIR (installer folder)" -ForegroundColor White
Write-Host "  - $zipName (distribution package)" -ForegroundColor White
Write-Host ""
Write-Host "Package includes:" -ForegroundColor Cyan
Write-Host "  - INSTALL.bat (installer)" -ForegroundColor Green
Write-Host "  - START.bat (launcher)" -ForegroundColor Green
Write-Host "  - RUN_PORTABLE.bat (portable mode)" -ForegroundColor Green
Write-Host "  - server/ (backend)" -ForegroundColor Green
Write-Host "  - dist/ (frontend)" -ForegroundColor Green
Write-Host ""
Write-Host "Ready for distribution!" -ForegroundColor Green