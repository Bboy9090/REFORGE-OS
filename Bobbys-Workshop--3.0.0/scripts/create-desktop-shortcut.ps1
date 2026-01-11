# ============================================
# CREATE DESKTOP SHORTCUT - BOBBY'S WORKSHOP
# ============================================
# Creates a desktop shortcut for Bobby's Workshop
# Handles both development (npm run tauri:dev) and production (built app) modes

param(
    [string]$Mode = "dev",  # "dev" or "production"
    [string]$AppName = "Bobby's Workshop",
    [string]$IconPath = ""
)

$ErrorActionPreference = "Stop"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Desktop shortcut path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "$AppName.lnk"

# Default icon path (if not provided)
if ([string]::IsNullOrWhiteSpace($IconPath)) {
    # Try to find icon in project
    $iconOptions = @(
        Join-Path $projectRoot "src-tauri" "icons" "icon.ico",
        Join-Path $projectRoot "src-tauri" "icons" "32x32.png",
        Join-Path $projectRoot "assets" "icon.ico",
        Join-Path $projectRoot "icon.ico"
    )
    
    foreach ($option in $iconOptions) {
        if (Test-Path $option) {
            $IconPath = $option
            break
        }
    }
    
    # If still no icon, use default
    if ([string]::IsNullOrWhiteSpace($IconPath)) {
        $IconPath = Join-Path $env:SystemRoot "System32" "shell32.dll"
        $IconIndex = 137  # Default application icon
    }
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🖥️  CREATING DESKTOP SHORTCUT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   Mode: $Mode" -ForegroundColor Gray
Write-Host "   App Name: $AppName" -ForegroundColor Gray
Write-Host "   Desktop Path: $desktopPath" -ForegroundColor Gray
Write-Host "   Shortcut: $shortcutPath" -ForegroundColor Gray
Write-Host ""

# Determine target and arguments based on mode
if ($Mode -eq "production" -or $Mode -eq "prod") {
    # Production: Launch built Tauri app
    $appExe = Join-Path $projectRoot "src-tauri" "target" "release" "$($AppName -replace '[^\w]', '').exe"
    
    if (-not (Test-Path $appExe)) {
        Write-Host "⚠️  Production app not found at: $appExe" -ForegroundColor Yellow
        Write-Host "   Building in production mode instead..." -ForegroundColor Gray
        $Mode = "dev"
    }
}

if ($Mode -eq "dev") {
    # Development: Launch via silent launcher
    $launcherScript = Join-Path $projectRoot "start-silent.bat"
    
    if (-not (Test-Path $launcherScript)) {
        # Create launcher script if it doesn't exist
        Write-Host "📝 Creating launcher script..." -ForegroundColor Cyan
        $launcherContent = @"
@echo off
cd /d "%~dp0"
call npm run tauri:dev
"@
        Set-Content -Path $launcherScript -Value $launcherContent -Encoding ASCII
        Write-Host "   ✅ Launcher script created" -ForegroundColor Green
    }
    
    # Create VBScript wrapper to hide console
    $vbsWrapper = Join-Path $projectRoot "start-hidden.vbs"
    if (-not (Test-Path $vbsWrapper)) {
        Write-Host "📝 Creating VBScript wrapper..." -ForegroundColor Cyan
        $vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run """" & "$launcherScript" & """", 0, False
Set WshShell = Nothing
"@
        Set-Content -Path $vbsWrapper -Value $vbsContent -Encoding ASCII
        Write-Host "   ✅ VBScript wrapper created" -ForegroundColor Green
    }
    
    $targetPath = "wscript.exe"
    $arguments = "`"$vbsWrapper`""
    $workingDir = $projectRoot
} else {
    # Production: Direct executable
    $targetPath = $appExe
    $arguments = ""
    $workingDir = Split-Path -Parent $appExe
}

# Create shortcut using COM object
Write-Host "🔧 Creating shortcut..." -ForegroundColor Cyan

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $targetPath
    $Shortcut.Arguments = $arguments
    $Shortcut.WorkingDirectory = $workingDir
    $Shortcut.Description = "Bobby's Workshop - Development Tool"
    $Shortcut.WindowStyle = 7  # Minimized window (hidden)
    
    # Set icon
    if (Test-Path $IconPath) {
        if ($IconPath -match "\.ico$") {
            $Shortcut.IconLocation = $IconPath
        } elseif ($IconPath -match "shell32\.dll$") {
            $Shortcut.IconLocation = "$IconPath,$IconIndex"
        } else {
            # Try to use first available icon
            $Shortcut.IconLocation = $IconPath + ",0"
        }
        Write-Host "   ✅ Icon set: $IconPath" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Icon not found: $IconPath" -ForegroundColor Yellow
    }
    
    $Shortcut.Save()
    
    Write-Host ""
    Write-Host "✅ Desktop shortcut created successfully!" -ForegroundColor Green
    Write-Host "   Location: $shortcutPath" -ForegroundColor Gray
    Write-Host ""
    
    # Clean up COM object
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($Shortcut) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($WshShell) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    
} catch {
    Write-Host ""
    Write-Host "❌ Failed to create shortcut: $_" -ForegroundColor Red
    Write-Host "   Make sure you have permission to write to Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ SHORTCUT CREATION COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 You can now launch Bobby's Workshop from your desktop!" -ForegroundColor Green
Write-Host ""
