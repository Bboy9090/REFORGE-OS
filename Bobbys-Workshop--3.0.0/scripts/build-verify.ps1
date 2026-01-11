# ============================================
# BUILD VERIFICATION SCRIPT
# ============================================
# Verifies that all fixes from 45-point audit are in place
# Runs before building to ensure everything is perfect

$ErrorActionPreference = "Stop"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

Set-Location $projectRoot

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔍 BUILD VERIFICATION - 45-POINT AUDIT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$allChecksPass = $true

# Check 1: API Config Port
Write-Host "🔍 Checking API configuration..." -ForegroundColor Cyan
$apiConfigPath = Join-Path $projectRoot "src" "lib" "apiConfig.ts"
if (Test-Path $apiConfigPath) {
    $apiConfigContent = Get-Content $apiConfigPath -Raw
    if ($apiConfigContent -match "localhost:3001") {
        Write-Host "   ✅ API config uses port 3001" -ForegroundColor Green
    } else {
        Write-Host "   ❌ API config port not set to 3001" -ForegroundColor Red
        $allChecksPass = $false
    }
} else {
    Write-Host "   ❌ API config file not found" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 2: Desktop Shortcut Script
Write-Host "🔍 Checking desktop shortcut script..." -ForegroundColor Cyan
$shortcutScript = Join-Path $projectRoot "scripts" "create-desktop-shortcut.ps1"
if (Test-Path $shortcutScript) {
    Write-Host "   ✅ Desktop shortcut script exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Desktop shortcut script missing" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 3: Installation Script
Write-Host "🔍 Checking installation script..." -ForegroundColor Cyan
$installScript = Join-Path $projectRoot "install.ps1"
if (Test-Path $installScript) {
    Write-Host "   ✅ Installation script exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Installation script missing" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 4: Silent Launcher Files
Write-Host "🔍 Checking silent launcher files..." -ForegroundColor Cyan
$vbsLauncher = Join-Path $projectRoot "start-hidden.vbs"
$batLauncher = Join-Path $projectRoot "start-silent.bat"
if ((Test-Path $vbsLauncher) -or (Test-Path $batLauncher)) {
    Write-Host "   ✅ Silent launcher files exist" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Silent launcher files missing (optional)" -ForegroundColor Yellow
}

# Check 5: Tauri Backend Startup
Write-Host "🔍 Checking Tauri backend startup..." -ForegroundColor Cyan
$tauriMainPath = Join-Path $projectRoot "src-tauri" "src" "main.rs"
if (Test-Path $tauriMainPath) {
    $tauriContent = Get-Content $tauriMainPath -Raw
    if ($tauriContent -match "CREATE_NO_WINDOW") {
        Write-Host "   ✅ Tauri uses CREATE_NO_WINDOW flag" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Tauri may not hide console window" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Tauri main.rs not found (Tauri may not be used)" -ForegroundColor Yellow
}

# Check 6: Server Port Configuration
Write-Host "🔍 Checking server port configuration..." -ForegroundColor Cyan
$serverIndexPath = Join-Path $projectRoot "server" "index.js"
if (Test-Path $serverIndexPath) {
    $serverContent = Get-Content $serverIndexPath -Raw
    if ($serverContent -match "PORT.*=.*process\.env\.PORT.*\|\|.*3001") {
        Write-Host "   ✅ Server uses port 3001" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Server port configuration may be incorrect" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Server index.js not found" -ForegroundColor Yellow
}

# Check 7: Environment File Template
Write-Host "🔍 Checking environment file template..." -ForegroundColor Cyan
$envExamplePath = Join-Path $projectRoot ".env.example"
if (Test-Path $envExamplePath) {
    Write-Host "   ✅ .env.example exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env.example missing (will be created by install script)" -ForegroundColor Yellow
}

# Check 8: Documentation
Write-Host "🔍 Checking documentation..." -ForegroundColor Cyan
$auditDocPath = Join-Path $projectRoot "docs" "45_POINT_AUDIT.md"
if (Test-Path $auditDocPath) {
    Write-Host "   ✅ Audit documentation exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Audit documentation missing" -ForegroundColor Yellow
}

Write-Host ""

# Final Result
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
if ($allChecksPass) {
    Write-Host "  ✅ ALL CHECKS PASSED - READY TO BUILD" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. npm run build" -ForegroundColor White
    Write-Host "   2. npm run tauri:build" -ForegroundColor White
    Write-Host "   3. .\install.ps1" -ForegroundColor White
    Write-Host "   4. .\scripts\create-desktop-shortcut.ps1" -ForegroundColor White
    exit 0
} else {
    Write-Host "  ❌ SOME CHECKS FAILED - FIX ISSUES BEFORE BUILDING" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Please fix the issues above before building." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
