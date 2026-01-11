@echo off
REM 🚀 Pandora Codex - One-Click Run Script (Windows)
REM Double-click this file to start the server

echo ========================================
echo 🎯 Pandora Codex - Starting Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Check if tools are installed
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  ADB not found. Run install.ps1 first!
    echo.
)

where scrcpy >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  scrcpy not found. Run install.ps1 first!
    echo.
)

REM Start the server
echo 🚀 Starting Pandora Codex server...
echo.
echo Server will start at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:3001

npm run dev

pause
