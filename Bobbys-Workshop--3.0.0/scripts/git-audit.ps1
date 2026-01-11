#!/usr/bin/env pwsh

<#
.SYNOPSIS
  Writes a local Git audit report to a log file.

.DESCRIPTION
  Captures:
    - current git status
    - local branches (with upstream)
    - branches not merged into a base branch
    - commits ahead per not-merged branch

  This script is intentionally read-only: it does not fetch, merge, reset, or delete.

.PARAMETER BaseBranch
  The branch to compare against (default: main-tool-kit).

.PARAMETER OutputPath
  Where to write the report. If a relative path is provided, it is resolved under the repo root.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\git-audit.ps1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\git-audit.ps1 -BaseBranch main-tool-kit -OutputPath git-audit.log
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$BaseBranch = 'main-tool-kit',

    [Parameter()]
    [string]$OutputPath = 'git-audit.log'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-Git {
    param(
        [Parameter(Mandatory)]
        [string[]]$Args
    )

    # Capture stderr as output so Windows PowerShell doesn't treat it as a terminating error.
    $output = & git @Args 2>&1
    $exitCode = $LASTEXITCODE

    [pscustomobject]@{
        ExitCode = $exitCode
        Output   = @($output)
    }
}

function Write-Section {
    param(
        [Parameter(Mandatory)]
        [string]$Title,

        [Parameter()]
        [string[]]$Lines = @()
    )

    "=== $Title ===" | Out-File -FilePath $script:LogPath -Append -Encoding utf8
    foreach ($line in $Lines) {
        $line | Out-File -FilePath $script:LogPath -Append -Encoding utf8
    }
    '' | Out-File -FilePath $script:LogPath -Append -Encoding utf8
}

function Require-Command {
    param([Parameter(Mandatory)][string]$Name)

    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "Required command '$Name' was not found in PATH."
    }
}

Require-Command -Name 'git'

# Determine repo root
$repoRootResult = Invoke-Git -Args @('rev-parse', '--show-toplevel')
if ($repoRootResult.ExitCode -ne 0 -or -not $repoRootResult.Output) {
    throw "Not inside a Git repository (git rev-parse --show-toplevel failed). Output: $($repoRootResult.Output -join ' ')"
}

$repoRootCandidates = @(
    $repoRootResult.Output |
        ForEach-Object { $_.ToString().Trim() } |
        Where-Object { $_ -ne '' }
)

$repoRoot = $null
$reversedCandidates = @($repoRootCandidates)
[array]::Reverse($reversedCandidates)
foreach ($candidate in $reversedCandidates) {
    if (Test-Path -LiteralPath $candidate -PathType Container) {
        $repoRoot = $candidate
        break
    }
}

if (-not $repoRoot) {
    throw "Failed to resolve repo root directory from git output. Output: $($repoRootResult.Output -join ' | ')"
}

Set-Location -LiteralPath $repoRoot

if ([System.IO.Path]::IsPathRooted($OutputPath)) {
    $script:LogPath = $OutputPath
} else {
    $script:LogPath = Join-Path -Path $repoRoot -ChildPath $OutputPath
}

"Git Audit Report" | Out-File -FilePath $script:LogPath -Encoding utf8
("Generated: {0}" -f (Get-Date).ToString('u')) | Out-File -FilePath $script:LogPath -Append -Encoding utf8
("Repo: {0}" -f $repoRoot) | Out-File -FilePath $script:LogPath -Append -Encoding utf8
("Base branch: {0}" -f $BaseBranch) | Out-File -FilePath $script:LogPath -Append -Encoding utf8
'' | Out-File -FilePath $script:LogPath -Append -Encoding utf8

# Validate base branch exists (local or remote ref)
$verifyBase = Invoke-Git -Args @('rev-parse', '--verify', $BaseBranch)
if ($verifyBase.ExitCode -ne 0) {
    throw "Base branch '$BaseBranch' does not exist (git rev-parse --verify $BaseBranch). Output: $($verifyBase.Output -join ' ')"
}

Write-Section -Title 'STATUS' -Lines (Invoke-Git -Args @('status', '-sb')).Output
Write-Section -Title 'LOCAL BRANCHES' -Lines (Invoke-Git -Args @('branch', '-vv')).Output

$notMergedRaw = (Invoke-Git -Args @('branch', '--no-merged', $BaseBranch)).Output
$notMerged = @(
    $notMergedRaw |
        ForEach-Object { $_.ToString().Trim() } |
        Where-Object { $_ -ne '' } |
    ForEach-Object { $_ -replace '^[\*\+]\s*', '' }
)

Write-Section -Title "NOT MERGED INTO $BaseBranch" -Lines $notMerged

if ($notMerged.Count -gt 0) {
    "=== AHEAD COMMITS PER NOT-MERGED BRANCH ===" | Out-File -FilePath $script:LogPath -Append -Encoding utf8
    foreach ($branch in $notMerged) {
        '' | Out-File -FilePath $script:LogPath -Append -Encoding utf8
        ("--- {0} ---" -f $branch) | Out-File -FilePath $script:LogPath -Append -Encoding utf8

        $aheadResult = Invoke-Git -Args @('log', '--oneline', "$BaseBranch..$branch")
        if ($aheadResult.ExitCode -ne 0) {
            ("[ERROR] Failed to compute log for {0}. Output: {1}" -f $branch, ($aheadResult.Output -join ' ')) | Out-File -FilePath $script:LogPath -Append -Encoding utf8
            continue
        }

        $ahead = @($aheadResult.Output)
        if ($ahead.Count -eq 0) {
            '(no commits ahead)' | Out-File -FilePath $script:LogPath -Append -Encoding utf8
        } else {
            $ahead | Out-File -FilePath $script:LogPath -Append -Encoding utf8
        }
    }
    '' | Out-File -FilePath $script:LogPath -Append -Encoding utf8
}

Write-Host "[OK] Wrote git audit to: $script:LogPath"