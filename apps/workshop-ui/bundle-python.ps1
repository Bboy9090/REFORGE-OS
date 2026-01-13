# Bundle Python Runtime for REFORGE OS

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Bundling Python Runtime for REFORGE OS                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResourcesDir = Join-Path $ScriptDir "src-tauri\resources"
$PythonDir = Join-Path $ResourcesDir "python"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$SourcePython = Join-Path $ProjectRoot "python"

# Step 1: Create resources directory
Write-Host "Step 1: Creating resources directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ResourcesDir | Out-Null
New-Item -ItemType Directory -Force -Path $PythonDir | Out-Null
Write-Host "✓ Resources directory created" -ForegroundColor Green
Write-Host ""

# Step 2: Check for Python embeddable
Write-Host "Step 2: Checking for Python runtime..." -ForegroundColor Yellow

# Option A: Use system Python (dev mode)
if (Get-Command python -ErrorAction SilentlyContinue) {
    $PythonExe = (Get-Command python).Source
    Write-Host "✓ Found system Python: $PythonExe" -ForegroundColor Green
    Write-Host "  (Using system Python for development)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For production, download Python embeddable package:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://www.python.org/downloads/windows/" -ForegroundColor Gray
    Write-Host "  2. Download: Windows embeddable package (64-bit)" -ForegroundColor Gray
    Write-Host "  3. Extract to: $PythonDir" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠ Python not found in PATH" -ForegroundColor Yellow
    Write-Host "  Install Python 3.11+ or download embeddable package" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Copy Python app code
Write-Host "Step 3: Copying Python app code..." -ForegroundColor Yellow
if (Test-Path $SourcePython) {
    $AppDir = Join-Path $PythonDir "app"
    New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
    
    # Copy app files
    Copy-Item -Path (Join-Path $SourcePython "app\*") -Destination $AppDir -Recurse -Force
    Copy-Item -Path (Join-Path $SourcePython "requirements.txt") -Destination $PythonDir -Force -ErrorAction SilentlyContinue
    
    Write-Host "✓ Python app code copied" -ForegroundColor Green
} else {
    Write-Host "⚠ Source Python directory not found: $SourcePython" -ForegroundColor Yellow
    Write-Host "  Creating placeholder structure..." -ForegroundColor Gray
    
    # Create placeholder structure
    $AppDir = Join-Path $PythonDir "app"
    New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
    Write-Host "✓ Placeholder structure created" -ForegroundColor Green
}
Write-Host ""

# Step 4: Update Tauri config
Write-Host "Step 4: Updating Tauri configuration..." -ForegroundColor Yellow
$TauriConfig = Join-Path $ScriptDir "src-tauri\tauri.conf.json"

if (Test-Path $TauriConfig) {
    $config = Get-Content $TauriConfig | ConvertFrom-Json
    
    # Ensure bundle.resources exists
    if (-not $config.tauri.bundle.resources) {
        $config.tauri.bundle | Add-Member -MemberType NoteProperty -Name "resources" -Value @("python/**")
    } else {
        if ($config.tauri.bundle.resources -notcontains "python/**") {
            $config.tauri.bundle.resources += "python/**"
        }
    }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content $TauriConfig
    Write-Host "✓ Tauri config updated" -ForegroundColor Green
} else {
    Write-Host "⚠ Tauri config not found" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Summary
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   Python Bundling Complete                              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Python app code location:" -ForegroundColor Cyan
Write-Host "  $PythonDir\app\" -ForegroundColor White
Write-Host ""
Write-Host "For production build:" -ForegroundColor Yellow
Write-Host "  1. Download Python embeddable package" -ForegroundColor Gray
Write-Host "  2. Extract to: $PythonDir" -ForegroundColor Gray
Write-Host "  3. Ensure python.exe is in: $PythonDir" -ForegroundColor Gray
Write-Host ""
Write-Host "For development:" -ForegroundColor Yellow
Write-Host "  System Python will be used (already configured)" -ForegroundColor Gray
Write-Host ""
