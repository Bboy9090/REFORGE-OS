# Git Sync Script for REFORGE-OS
# This script will sync your local repository with the remote GitHub repository

$ErrorActionPreference = "Stop"
$repoPath = $PSScriptRoot

Write-Host "=== Git Sync Script for REFORGE-OS ===" -ForegroundColor Cyan
Write-Host "Repository: $repoPath" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "ERROR: Git is not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Git or add it to your PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Git on Windows:" -ForegroundColor Yellow
    Write-Host "  1. Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "  2. Or use winget: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found Git at: $($gitCmd.Source)" -ForegroundColor Green
Write-Host ""

# Change to repository directory
Set-Location $repoPath

# Step 1: Check current status
Write-Host "Step 1: Checking repository status..." -ForegroundColor Cyan
git status
Write-Host ""

# Step 2: Fetch latest changes from remote
Write-Host "Step 2: Fetching latest changes from remote..." -ForegroundColor Cyan
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to fetch from remote!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Check if there are uncommitted changes
Write-Host "Step 3: Checking for uncommitted changes..." -ForegroundColor Cyan
$statusOutput = git status --porcelain
if ($statusOutput) {
    Write-Host "WARNING: You have uncommitted changes!" -ForegroundColor Yellow
    Write-Host "Uncommitted files:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $response = Read-Host "Do you want to stash changes before syncing? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git stash push -m "Stashed before sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "Changes stashed successfully." -ForegroundColor Green
    } else {
        Write-Host "Proceeding without stashing. Uncommitted changes will remain." -ForegroundColor Yellow
    }
    Write-Host ""
}

# Step 4: Get current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Step 5: Check if local branch is behind/ahead of remote
Write-Host "Step 5: Checking branch status..." -ForegroundColor Cyan
git status -sb
Write-Host ""

# Step 6: Rebase local changes on top of remote (if needed)
Write-Host "Step 6: Rebasing local branch on top of remote..." -ForegroundColor Cyan
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/$currentBranch 2>$null

if ($LASTEXITCODE -eq 0) {
    if ($localCommit -ne $remoteCommit) {
        Write-Host "Local and remote branches differ. Rebasing..." -ForegroundColor Yellow
        git rebase origin/$currentBranch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Rebase failed! You may need to resolve conflicts manually." -ForegroundColor Red
            Write-Host "Use 'git rebase --abort' to cancel, or resolve conflicts and use 'git rebase --continue'" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Rebase completed successfully." -ForegroundColor Green
    } else {
        Write-Host "Local branch is already up to date with remote." -ForegroundColor Green
    }
} else {
    Write-Host "Remote branch not found. This is expected for new branches." -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Pull latest changes (if any)
Write-Host "Step 7: Pulling latest changes..." -ForegroundColor Cyan
git pull origin $currentBranch --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Pull failed. This might be expected if you're ahead of remote." -ForegroundColor Yellow
} else {
    Write-Host "Pull completed successfully." -ForegroundColor Green
}
Write-Host ""

# Step 8: Push local changes to remote (if any)
Write-Host "Step 8: Pushing local changes to remote..." -ForegroundColor Cyan
$pushOutput = git push origin $currentBranch 2>&1
if ($LASTEXITCODE -ne 0) {
    if ($pushOutput -match "no upstream branch") {
        Write-Host "Setting upstream branch..." -ForegroundColor Yellow
        git push -u origin $currentBranch
    } else {
        Write-Host "WARNING: Push failed or nothing to push." -ForegroundColor Yellow
        Write-Host $pushOutput
    }
} else {
    Write-Host "Push completed successfully." -ForegroundColor Green
}
Write-Host ""

# Step 9: Final status
Write-Host "Step 9: Final repository status..." -ForegroundColor Cyan
git status
Write-Host ""

# Step 10: Show branch comparison
Write-Host "Step 10: Branch comparison..." -ForegroundColor Cyan
$behind = git rev-list --count HEAD..origin/$currentBranch 2>$null
$ahead = git rev-list --count origin/$currentBranch..HEAD 2>$null

if ($LASTEXITCODE -eq 0) {
    if ($behind -gt 0) {
        Write-Host "Local branch is $behind commit(s) behind remote." -ForegroundColor Yellow
    }
    if ($ahead -gt 0) {
        Write-Host "Local branch is $ahead commit(s) ahead of remote." -ForegroundColor Yellow
    }
    if ($behind -eq 0 -and $ahead -eq 0) {
        Write-Host "Local and remote branches are in sync!" -ForegroundColor Green
    }
} else {
    Write-Host "Remote branch comparison not available." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Sync Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Repository URL: https://github.com/Bboy9090/REFORGE-OS" -ForegroundColor Cyan
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan
