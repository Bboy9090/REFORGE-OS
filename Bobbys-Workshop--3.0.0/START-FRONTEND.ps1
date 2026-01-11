# ============================================
# 🎨 BOBBY'S WORKSHOP - FRONTEND SERVER
# ============================================
# Keep this window open!
# This runs the React/Vite frontend

$ErrorActionPreference = "Stop"

# Set window title
$Host.UI.RawUI.WindowTitle = "🎨 BOBBY'S WORKSHOP - FRONTEND (Port 5000)"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🎨 BOBBY'S WORKSHOP - FRONTEND SERVER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot

Write-Host "📁 Working Directory: $projectRoot" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Starting React frontend on http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  KEEP THIS WINDOW OPEN!" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Start npm dev server
npm run dev
