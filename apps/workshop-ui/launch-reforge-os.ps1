# REFORGE OS Launcher
# Navigate to the workshop-ui directory and start the application

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Starting REFORGE OS..." -ForegroundColor Green
npm run dev
