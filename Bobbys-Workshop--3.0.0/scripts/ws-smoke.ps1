#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Smoke-test Bobby's Workshop backend REST + WebSocket endpoints.

.DESCRIPTION
  Verifies that the backend is reachable over HTTP and that key WebSocket endpoints
  accept connections. For /ws/flash-progress it also verifies ping/pong.

.PARAMETER BaseUrl
  Base HTTP URL for the backend (default: http://localhost:3001).

.PARAMETER TimeoutSec
  Timeout in seconds for each connection attempt (default: 5).

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ws-smoke.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ws-smoke.ps1 -BaseUrl http://localhost:3001 -TimeoutSec 10
#>

[CmdletBinding()]
param(
  [string]$BaseUrl = 'http://localhost:3001',
  [int]$TimeoutSec = 5
)

$ErrorActionPreference = 'Stop'

function Get-WsBaseUrl([string]$httpBase) {
  $u = [Uri]$httpBase
  $scheme = if ($u.Scheme -eq 'https') { 'wss' } else { 'ws' }
  $pathBase = if ([string]::IsNullOrEmpty($u.AbsolutePath) -or $u.AbsolutePath -eq '/') { '' } else { $u.AbsolutePath.TrimEnd('/') }
  return ("{0}://{1}:{2}{3}" -f $scheme, $u.Host, $u.Port, $pathBase)
}

function Test-Http([string]$url) {
  Write-Host "[HTTP] GET $url"
  $r = Invoke-RestMethod -Uri $url -TimeoutSec $TimeoutSec
  $json = $r | ConvertTo-Json -Depth 6
  Write-Host "[HTTP] OK $json"
}

function Test-WebSocketPing([string]$wsUrl) {
  Write-Host "[WS] connect $wsUrl"
  $uri = [Uri]$wsUrl
  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  # Avoid system proxy oddities for localhost
  $ws.Options.Proxy = $null

  $cts = [System.Threading.CancellationTokenSource]::new([TimeSpan]::FromSeconds($TimeoutSec))
  $ws.ConnectAsync($uri, $cts.Token).GetAwaiter().GetResult()

  $payload = ('{"type":"ping","timestamp":' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + '}')
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  $seg = [System.ArraySegment[byte]]::new($bytes)
  $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).GetAwaiter().GetResult()

  $buffer = New-Object byte[] 4096
  $recv = [System.ArraySegment[byte]]::new($buffer)
  $result = $ws.ReceiveAsync($recv, $cts.Token).GetAwaiter().GetResult()
  $text = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count)

  Write-Host "[WS] message $text"

  $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', $cts.Token).GetAwaiter().GetResult()
  Write-Host "[WS] OK"
}

function Test-WebSocketConnect([string]$wsUrl) {
  Write-Host "[WS] connect $wsUrl"
  $uri = [Uri]$wsUrl
  $ws = [System.Net.WebSockets.ClientWebSocket]::new()
  $ws.Options.Proxy = $null

  $cts = [System.Threading.CancellationTokenSource]::new([TimeSpan]::FromSeconds($TimeoutSec))
  $ws.ConnectAsync($uri, $cts.Token).GetAwaiter().GetResult()
  $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'done', $cts.Token).GetAwaiter().GetResult()
  Write-Host "[WS] OK"
}

try {
  Test-Http "$BaseUrl/api/health"
  Test-Http "$BaseUrl/api/system-info"

  $wsBase = Get-WsBaseUrl $BaseUrl
  Test-WebSocketPing "$wsBase/ws/flash-progress"
  Test-WebSocketConnect "$wsBase/ws/device-events"

  Write-Host "[SUCCESS] Backend REST + WS are reachable"
  exit 0
} catch {
  Write-Error "[FAIL] $($_.Exception.Message)"
  exit 1
}
