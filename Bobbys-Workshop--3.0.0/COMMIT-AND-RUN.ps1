# ============================================
# 🔥 BOBBY'S WORKSHOP - COMMIT & RUN
# ============================================
# Git commit + Build + Run in one command
# Use this when you want to commit changes and run the app

$ErrorActionPreference = "Stop"

# Set window title
$Host.UI.RawUI.WindowTitle = "🔥 BOBBY'S WORKSHOP - COMMIT & RUN"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔥 BOBBY'S WORKSHOP - COMMIT & RUN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Set-Location $projectRoot

# ============================================
# STEP 1: CHECK GIT STATUS
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 1: CHECKING GIT STATUS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$isGitRepo = Test-Path ".git"
if (-not $isGitRepo) {
    Write-Host "⚠️  Not a git repository. Skipping commit step." -ForegroundColor Yellow
    Write-Host "   Running build & run only..." -ForegroundColor Gray
    Write-Host ""
    & "$projectRoot\BUILD-AND-RUN.ps1"
    exit
}

Write-Host "📋 Git status:" -ForegroundColor Cyan
git status --short
Write-Host ""

$hasChanges = git diff --quiet 2>$null; $exitCode = $LASTEXITCODE
$hasUntracked = git ls-files --others --exclude-standard | Select-Object -First 1

if ($exitCode -eq 0 -and -not $hasUntracked) {
    Write-Host "✅ No changes to commit." -ForegroundColor Green
    Write-Host "   Running build & run only..." -ForegroundColor Gray
    Write-Host ""
    & "$projectRoot\BUILD-AND-RUN.ps1"
    exit
}

Write-Host "📝 Changes detected. Preparing commit..." -ForegroundColor Cyan
Write-Host ""

# ============================================
# STEP 2: ASK FOR COMMIT MESSAGE
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 2: COMMIT CHANGES" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$defaultMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Enter commit message (press Enter for default):" -ForegroundColor Cyan
Write-Host "Default: $defaultMessage" -ForegroundColor Gray
$commitMessage = Read-Host "Commit message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = $defaultMessage
}

Write-Host ""
Write-Host "📦 Staging all changes..." -ForegroundColor Cyan
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Git add failed. Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "💾 Committing changes..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Commit failed (maybe nothing to commit?). Continuing..." -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Changes committed!" -ForegroundColor Green
}

Write-Host ""

# ============================================
# STEP 3: BUILD & RUN
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  STEP 3: BUILDING & RUNNING" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

& "$projectRoot\BUILD-AND-RUN.ps1"
