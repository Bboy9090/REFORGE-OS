# ============================================
# REMOVE DESKTOP SHORTCUT - BOBBY'S WORKSHOP
# ============================================
# Removes the desktop shortcut for Bobby's Workshop

param(
    [string]$AppName = "Bobby's Workshop"
)

$ErrorActionPreference = "Stop"

# Desktop shortcut path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "$AppName.lnk"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🗑️  REMOVING DESKTOP SHORTCUT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $shortcutPath) {
    try {
        Remove-Item -Path $shortcutPath -Force
        Write-Host "✅ Desktop shortcut removed successfully!" -ForegroundColor Green
        Write-Host "   Removed: $shortcutPath" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to remove shortcut: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Shortcut not found: $shortcutPath" -ForegroundColor Gray
    Write-Host "   Nothing to remove." -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ REMOVAL COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
