# Backend API Connection & Feature Test Script
# Tests all backend endpoints and connection detection features
# Bobby's Workshop - API Validation

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"
$results = @()

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Description,
        [hashtable]$Body = $null
    )
    
    Write-Host "`nTesting: $Description" -ForegroundColor Cyan
    Write-Host "Endpoint: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        Write-Host "✓ SUCCESS" -ForegroundColor Green
        Write-Host "  Status: $statusCode" -ForegroundColor Gray
        
        if ($content) {
            Write-Host "  Response: $($content | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
        }
        
        $script:results += [PSCustomObject]@{
            Endpoint = $Url
            Method = $Method
            Description = $Description
            Status = "SUCCESS"
            StatusCode = $statusCode
            HasData = ($content -ne $null)
        }
        
        return $content
        
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $errorMsg" -ForegroundColor Yellow
        
        $script:results += [PSCustomObject]@{
            Endpoint = $Url
            Method = $Method
            Description = $Description
            Status = "FAILED"
            Error = $errorMsg
        }
        
        return $null
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Bobby's Workshop - API Connection Tests" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================

Write-Host "[1] HEALTH & STATUS CHECKS" -ForegroundColor Yellow

$health = Test-Endpoint -Url "$baseUrl/api/health" `
    -Description "Backend health check"

if ($health) {
    Write-Host "  Backend is ONLINE" -ForegroundColor Green
} else {
    Write-Host "  Backend is OFFLINE - Start with: npm run server:dev" -ForegroundColor Red
    Write-Host "`nCannot proceed with API tests. Exiting.`n" -ForegroundColor Yellow
    exit 1
}

# ============================================================================
# 2. SYSTEM TOOLS DETECTION
# ============================================================================

Write-Host "`n[2] SYSTEM TOOLS DETECTION" -ForegroundColor Yellow

$tools = Test-Endpoint -Url "$baseUrl/api/system-tools" `
    -Description "Detect installed development tools"

if ($tools -and $tools.tools) {
    Write-Host "`nInstalled Tools:" -ForegroundColor Cyan
    $tools.tools.PSObject.Properties | ForEach-Object {
        $name = $_.Name
        $tool = $_.Value
        $status = if ($tool.installed) { "✓" } else { "✗" }
        $version = if ($tool.version) { $tool.version } else { "N/A" }
        
        $color = if ($tool.installed) { "Green" } else { "Gray" }
        Write-Host "  $status $name : $version" -ForegroundColor $color
    }
}

# ============================================================================
# 3. ANDROID DEVICE DETECTION
# ============================================================================

Write-Host "`n[3] ANDROID DEVICE DETECTION" -ForegroundColor Yellow

$androidDevices = Test-Endpoint -Url "$baseUrl/api/android-devices/all" `
    -Description "Detect all Android devices (ADB + Fastboot)"

if ($androidDevices) {
    Write-Host "`nADB Status:" -ForegroundColor Cyan
    Write-Host "  Available: $($androidDevices.sources.adb.available)" -ForegroundColor Gray
    Write-Host "  Device Count: $($androidDevices.sources.adb.count)" -ForegroundColor Gray
    
    Write-Host "`nFastboot Status:" -ForegroundColor Cyan
    Write-Host "  Available: $($androidDevices.sources.fastboot.available)" -ForegroundColor Gray
    Write-Host "  Device Count: $($androidDevices.sources.fastboot.count)" -ForegroundColor Gray
    
    if ($androidDevices.devices -and $androidDevices.devices.Count -gt 0) {
        Write-Host "`nConnected Devices:" -ForegroundColor Cyan
        foreach ($device in $androidDevices.devices) {
            Write-Host "  - $($device.serialNumber) [$($device.source)] - $($device.state)" -ForegroundColor Green
        }
    } else {
        Write-Host "`nNo devices connected (this is OK for testing)" -ForegroundColor Gray
    }
}

# ============================================================================
# 4. ADB SPECIFIC ENDPOINTS
# ============================================================================

Write-Host "`n[4] ADB SPECIFIC TESTS" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/adb/devices" `
    -Description "Get ADB devices only"

Test-Endpoint -Url "$baseUrl/api/adb/version" `
    -Description "Get ADB version"

# ============================================================================
# 5. FASTBOOT SPECIFIC ENDPOINTS
# ============================================================================

Write-Host "`n[5] FASTBOOT SPECIFIC TESTS" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/fastboot/devices" `
    -Description "Get Fastboot devices only"

Test-Endpoint -Url "$baseUrl/api/fastboot/version" `
    -Description "Get Fastboot version"

# ============================================================================
# 6. iOS DEVICE DETECTION
# ============================================================================

Write-Host "`n[6] iOS DEVICE DETECTION" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/ios/scan" `
    -Description "Scan for iOS devices"

Test-Endpoint -Url "$baseUrl/api/ios/tools/check" `
    -Description "Check libimobiledevice installation"

# ============================================================================
# 7. FLASH OPERATION ENDPOINTS
# ============================================================================

Write-Host "`n[7] FLASH OPERATIONS" -ForegroundColor Yellow

$flashHistory = Test-Endpoint -Url "$baseUrl/api/flash/history" `
    -Description "Get flash operation history"

if ($flashHistory -and $flashHistory.operations) {
    Write-Host "  Operations in history: $($flashHistory.operations.Count)" -ForegroundColor Gray
}

# ============================================================================
# 8. SECURITY DETECTION ENDPOINTS
# ============================================================================

Write-Host "`n[8] SECURITY DETECTION" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/security/info" `
    -Description "Get security detection capabilities"

# Note: FRP/MDM detection requires device serial, skip for now
Write-Host "`nSkipping FRP/MDM detection (requires connected device)" -ForegroundColor Gray

# ============================================================================
# 9. BOOTFORGE USB ENDPOINTS
# ============================================================================

Write-Host "`n[9] BOOTFORGE USB BACKEND" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/bootforge/scan" `
    -Description "Scan USB devices with BootForge"

Test-Endpoint -Url "$baseUrl/api/bootforge/status" `
    -Description "BootForge backend status"

# ============================================================================
# 10. TRAPDOOR API (Protected Endpoints)
# ============================================================================

Write-Host "`n[10] TRAPDOOR API (Protected)" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/trapdoor/workflows" `
    -Description "List available workflows"

# Note: Execution endpoints require authorization, skip for now
Write-Host "`nSkipping workflow execution (requires authorization)" -ForegroundColor Gray

# ============================================================================
# 11. WEBSOCKET CONNECTION TESTS
# ============================================================================

Write-Host "`n[11] WEBSOCKET ENDPOINTS" -ForegroundColor Yellow

Write-Host "`nWebSocket URLs (manual testing required):" -ForegroundColor Cyan
Write-Host "  - ws://localhost:3001/ws/flash" -ForegroundColor Gray
Write-Host "  - ws://localhost:3001/ws/hotplug" -ForegroundColor Gray
Write-Host "  - ws://localhost:3001/ws/correlation" -ForegroundColor Gray
Write-Host "`n  (WebSocket testing requires browser or wscat tool)" -ForegroundColor Yellow

# ============================================================================
# 12. PLUGIN SYSTEM ENDPOINTS
# ============================================================================

Write-Host "`n[12] PLUGIN SYSTEM" -ForegroundColor Yellow

Test-Endpoint -Url "$baseUrl/api/plugins/list" `
    -Description "List installed plugins"

Test-Endpoint -Url "$baseUrl/api/plugins/registry" `
    -Description "Plugin registry status"

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "API TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$totalTests = $results.Count
$successTests = ($results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$failedTests = ($results | Where-Object { $_.Status -eq "FAILED" }).Count

Write-Host "Total Endpoints Tested: $totalTests" -ForegroundColor White
Write-Host "Successful: $successTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

$successRate = if ($totalTests -gt 0) { [math]::Round(($successTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

# Export results
$exportPath = "api-test-results-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').json"
$results | ConvertTo-Json -Depth 10 | Out-File $exportPath
Write-Host "`nResults exported to: $exportPath" -ForegroundColor Cyan

# Failed endpoints detail
if ($failedTests -gt 0) {
    Write-Host "`nFailed Endpoints:" -ForegroundColor Yellow
    $results | Where-Object { $_.Status -eq "FAILED" } | ForEach-Object {
        Write-Host "  - $($_.Description)" -ForegroundColor Red
        Write-Host "    $($_.Method) $($_.Endpoint)" -ForegroundColor Gray
        Write-Host "    Error: $($_.Error)" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================`n" -ForegroundColor Cyan

# Key recommendations
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. If backend is offline, run: npm run server:dev" -ForegroundColor White
Write-Host "2. Connect test devices for full validation" -ForegroundColor White
Write-Host "3. Check failed endpoints and implement missing APIs" -ForegroundColor White
Write-Host "4. Test WebSocket connections with browser DevTools" -ForegroundColor White
Write-Host ""

exit 0
