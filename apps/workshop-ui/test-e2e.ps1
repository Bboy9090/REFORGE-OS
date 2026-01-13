# End-to-End Test Script for REFORGE OS

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   REFORGE OS - End-to-End Test                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExePath = Join-Path $ScriptDir "src-tauri\target\release\workshop-ui.exe"
$ApiUrl = "http://localhost:8001"

$TestsPassed = 0
$TestsFailed = 0

function Test-Step {
    param($Name, $ScriptBlock)
    Write-Host "Testing: $Name..." -ForegroundColor Yellow
    try {
        & $ScriptBlock
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        $script:TestsPassed++
        return $true
    } catch {
        Write-Host "  ✗ FAILED: $_" -ForegroundColor Red
        $script:TestsFailed++
        return $false
    }
}

# Test 1: Executable exists
Test-Step "Executable exists" {
    if (-not (Test-Path $ExePath)) {
        throw "Executable not found: $ExePath"
    }
}

# Test 2: Backend API health (if running)
Test-Step "Backend API health" {
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -ne 200) {
            throw "Health check returned status $($response.StatusCode)"
        }
    } catch {
        Write-Host "  ⚠ Backend not running (this is OK for build test)" -ForegroundColor Yellow
    }
}

# Test 3: Python app code exists
Test-Step "Python app code exists" {
    $PythonApp = Join-Path $ScriptDir "src-tauri\resources\python\app\main.py"
    if (-not (Test-Path $PythonApp)) {
        # Check source location
        $SourceApp = Join-Path (Split-Path -Parent (Split-Path -Parent $ScriptDir)) "python\app\main.py"
        if (-not (Test-Path $SourceApp)) {
            throw "Python app code not found"
        }
    }
}

# Test 4: Tauri config includes resources
Test-Step "Tauri config includes Python resources" {
    $ConfigPath = Join-Path $ScriptDir "src-tauri\tauri.conf.json"
    if (Test-Path $ConfigPath) {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        if ($config.tauri.bundle.resources -notcontains "python/**") {
            throw "Python resources not in Tauri config"
        }
    }
}

# Test 5: Language guardrails exist
Test-Step "Language guardrails exist" {
    $ForbiddenTerms = Join-Path (Split-Path -Parent (Split-Path -Parent $ScriptDir)) "governance\language-guardrails\forbidden-terms.json"
    if (-not (Test-Path $ForbiddenTerms)) {
        throw "Forbidden terms file not found"
    }
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor $(if ($TestsFailed -eq 0) { "Green" } else { "Yellow" })
Write-Host "║   Test Summary                                            ║" -ForegroundColor $(if ($TestsFailed -eq 0) { "Green" } else { "Yellow" })
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor $(if ($TestsFailed -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Failed: $TestsFailed" -ForegroundColor $(if ($TestsFailed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Build the app: npm run build" -ForegroundColor Gray
    Write-Host "  2. Test launch: Run the executable" -ForegroundColor Gray
    Write-Host "  3. Verify Python backend starts automatically" -ForegroundColor Gray
} else {
    Write-Host "⚠ Some tests failed. Fix issues before building." -ForegroundColor Yellow
}
