# Build and Create Desktop Shortcut Script
# Builds the application and creates a desktop shortcut named "bobbys secret rooms1.2"

param(
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false
)

Write-Host "`n🏗️ Building Bobby's Secret Rooms 1.2...`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Run E2E Tests (if not skipped)
if (-not $SkipTests) {
    Write-Host "Step 1: Running E2E tests...`n" -ForegroundColor Yellow
    
    # Check if Playwright is installed
    try {
        $playwrightVersion = npx playwright --version 2>&1
        Write-Host "✅ Playwright found: $playwrightVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Installing Playwright browsers..." -ForegroundColor Yellow
        npx playwright install chromium
        Write-Host "✅ Playwright installed!" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # Check if dev server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ Dev server is running on port 5000" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Dev server not running. Starting in background..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized
        
        # Wait for server to start
        Write-Host "   Waiting for dev server to start..." -ForegroundColor Yellow
        $maxAttempts = 30
        $attempt = 0
        $serverReady = $false
        
        while ($attempt -lt $maxAttempts -and -not $serverReady) {
            Start-Sleep -Seconds 2
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $serverReady = $true
                    Write-Host "✅ Dev server is ready!" -ForegroundColor Green
                }
            } catch {
                $attempt++
                Write-Host "." -NoNewline -ForegroundColor Gray
            }
        }
        
        if (-not $serverReady) {
            Write-Host "`n⚠️ Dev server failed to start. Skipping tests." -ForegroundColor Yellow
            $SkipTests = $true
        }
    }
    
    if (-not $SkipTests) {
        Write-Host "`nRunning E2E tests...`n" -ForegroundColor Yellow
        npm run test:e2e
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`n⚠️ Some tests failed. Continuing with build...`n" -ForegroundColor Yellow
        } else {
            Write-Host "`n✅ All E2E tests passed!`n" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Step 1: Skipping E2E tests (--SkipTests flag)`n" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Build Frontend
if (-not $SkipBuild) {
    Write-Host "Step 2: Building frontend...`n" -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "`n✅ Frontend build complete!`n" -ForegroundColor Green
} else {
    Write-Host "Step 2: Skipping frontend build (--SkipBuild flag)`n" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Update Tauri config with new app name
Write-Host "Step 3: Updating Tauri configuration...`n" -ForegroundColor Yellow

$tauriConfigPath = "src-tauri\tauri.conf.json"
if (Test-Path $tauriConfigPath) {
    $tauriConfig = Get-Content $tauriConfigPath -Raw | ConvertFrom-Json
    
    # Update product name
    $tauriConfig.productName = "bobbys secret rooms1.2"
    
    # Update identifier if needed
    if ($tauriConfig.tauri.bundle.identifier) {
        $tauriConfig.tauri.bundle.identifier = "com.bobbys.secretrooms"
    }
    
    # Update window title
    if ($tauriConfig.tauri.windows) {
        $tauriConfig.tauri.windows[0].title = "Bobby's Secret Rooms 1.2"
    }
    
    # Save updated config
    $tauriConfig | ConvertTo-Json -Depth 10 | Set-Content $tauriConfigPath -Encoding UTF8
    Write-Host "✅ Tauri configuration updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Tauri config not found. Skipping config update." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Build Tauri Desktop App
Write-Host "Step 4: Building Tauri desktop app...`n" -ForegroundColor Yellow
Write-Host "This may take several minutes...`n" -ForegroundColor Cyan

npm run tauri:build:windows
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Tauri build failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Tauri build complete!`n" -ForegroundColor Green

# Step 5: Find the built executable
Write-Host "Step 5: Locating built executable...`n" -ForegroundColor Yellow

$possiblePaths = @(
    "src-tauri\target\release\bobbys secret rooms1.2.exe",
    "src-tauri\target\release\bobbys-secret-rooms1.2.exe",
    "src-tauri\target\release\bobbys_secret_rooms1_2.exe",
    "src-tauri\target\release\*.exe"
)

$exePath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $exePath = (Resolve-Path $path).Path
        break
    }
}

# If not found, search for any .exe in release folder
if (-not $exePath) {
    $releaseExes = Get-ChildItem -Path "src-tauri\target\release" -Filter "*.exe" -ErrorAction SilentlyContinue
    if ($releaseExes) {
        $exePath = $releaseExes[0].FullName
    }
}

if (-not $exePath) {
    Write-Host "⚠️ Executable not found. Searching in bundle directory...`n" -ForegroundColor Yellow
    $bundleExes = Get-ChildItem -Path "src-tauri\target\release\bundle" -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue
    if ($bundleExes) {
        $exePath = $bundleExes[0].FullName
    }
}

if (-not $exePath) {
    Write-Host "❌ Could not find built executable!" -ForegroundColor Red
    Write-Host "Please check: src-tauri\target\release\" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found executable: $exePath`n" -ForegroundColor Green

# Step 6: Create Desktop Shortcut
Write-Host "Step 6: Creating desktop shortcut...`n" -ForegroundColor Yellow

$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "bobbys secret rooms1.2.lnk"

try {
    $WScriptShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $exePath
    $Shortcut.WorkingDirectory = Split-Path $exePath
    $Shortcut.Description = "Bobby's Secret Rooms 1.2 - Audio Forensic Intelligence & Device Manipulation"
    $Shortcut.IconLocation = $exePath
    
    # Try to set a custom icon if available
    $iconPath = "src-tauri\icons\icon.ico"
    if (Test-Path $iconPath) {
        $Shortcut.IconLocation = (Resolve-Path $iconPath).Path
    }
    
    $Shortcut.Save()
    
    Write-Host "✅ Desktop shortcut created: $shortcutPath`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create desktop shortcut: $_`n" -ForegroundColor Red
    Write-Host "You can manually create a shortcut to: $exePath`n" -ForegroundColor Yellow
    exit 1
}

# Step 7: Summary
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📦 Build Location:" -ForegroundColor Yellow
Write-Host "   $exePath`n" -ForegroundColor White

Write-Host "🖥️ Desktop Shortcut:" -ForegroundColor Yellow
Write-Host "   $shortcutPath`n" -ForegroundColor White

Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Double-click the desktop shortcut to launch" -ForegroundColor White
Write-Host "   2. The app will start with backend auto-launched" -ForegroundColor White
Write-Host "   3. All Secret Rooms are ready to use!`n" -ForegroundColor White

Write-Host "🏆 Bobby's Secret Rooms 1.2 is ready! 🏆`n" -ForegroundColor Magenta
