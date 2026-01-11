# E2E Test Runner Script
# Automates the E2E testing process

Write-Host "`n🧪 E2E Test Runner - Bobby's Workshop`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Playwright is installed
Write-Host "Step 1: Checking Playwright installation..." -ForegroundColor Yellow
try {
    $playwrightVersion = npx playwright --version 2>&1
    Write-Host "✅ Playwright found: $playwrightVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Playwright not found. Installing..." -ForegroundColor Yellow
    npx playwright install chromium
    Write-Host "✅ Playwright installed!" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check if dev server is running
Write-Host "Step 2: Checking if dev server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Dev server is running on port 5000!" -ForegroundColor Green
        $serverRunning = $true
    }
} catch {
    Write-Host "⚠️ Dev server is not running on port 5000." -ForegroundColor Yellow
    Write-Host "   Starting dev server in background..." -ForegroundColor Yellow
    
    # Start dev server in background
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
        Write-Host "`n❌ Dev server failed to start. Please start it manually:" -ForegroundColor Red
        Write-Host "   npm run dev" -ForegroundColor White
        Write-Host "`nThen run this script again.`n" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Step 3: Run E2E tests
Write-Host "Step 3: Running E2E tests..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════`n" -ForegroundColor Cyan

try {
    npm run test:e2e
    Write-Host "`n✅ E2E tests completed!" -ForegroundColor Green
    Write-Host "`n📊 View test report with:" -ForegroundColor Cyan
    Write-Host "   npm run test:e2e:report`n" -ForegroundColor White
} catch {
    Write-Host "`n❌ E2E tests failed. Check the output above for details.`n" -ForegroundColor Red
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "   • Make sure the dev server is running" -ForegroundColor White
    Write-Host "   • Check that Playwright browsers are installed" -ForegroundColor White
    Write-Host "   • View test report: npm run test:e2e:report`n" -ForegroundColor White
    exit 1
}
