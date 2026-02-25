param(
  [Parameter(Mandatory = $true)][string]$BeforeDir,
  [Parameter(Mandatory = $true)][string]$AfterDir,
  [string]$OutputFile = "summary-diff.md"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$beforePath = (Resolve-Path $BeforeDir).Path
$afterPath = (Resolve-Path $AfterDir).Path

$beforeCsv = Join-Path $beforePath "summary.csv"
$afterCsv = Join-Path $afterPath "summary.csv"

if (-not (Test-Path $beforeCsv)) {
  & (Join-Path $here "build-k6-summary.ps1") -ResultsDir $beforePath | Out-Null
}
if (-not (Test-Path $afterCsv)) {
  & (Join-Path $here "build-k6-summary.ps1") -ResultsDir $afterPath | Out-Null
}

$beforeRows = Import-Csv -Path $beforeCsv
$afterRows = Import-Csv -Path $afterCsv

$beforeMap = @{}
foreach ($r in $beforeRows) { $beforeMap[$r.Endpoint] = $r }

$lines = @()
$lines += "# K6 Results Diff (Before vs After)"
$lines += ""
$lines += "Before: $([System.IO.Path]::GetFileName($beforePath))"
$lines += ""
$lines += "After: $([System.IO.Path]::GetFileName($afterPath))"
$lines += ""
$lines += "| Endpoint | Avg (Before) | Avg (After) | Avg Delta ms | P95 (Before) | P95 (After) | P95 Delta ms |"
$lines += "|---|---:|---:|---:|---:|---:|---:|"

foreach ($a in ($afterRows | Sort-Object Endpoint)) {
  if (-not $beforeMap.ContainsKey($a.Endpoint)) { continue }
  $b = $beforeMap[$a.Endpoint]

  $bAvgMs = [double]$b.AvgMs
  $aAvgMs = [double]$a.AvgMs
  $bP95Ms = [double]$b.P95Ms
  $aP95Ms = [double]$a.P95Ms

  $avgDelta = [math]::Round($aAvgMs - $bAvgMs, 2)
  $p95Delta = [math]::Round($aP95Ms - $bP95Ms, 2)

  $lines += "| $($a.Endpoint) | $($b.Avg) | $($a.Avg) | $avgDelta | $($b.P95) | $($a.P95) | $p95Delta |"
}

$outPath = Join-Path $afterPath $OutputFile
Set-Content -Path $outPath -Value ($lines -join [Environment]::NewLine) -Encoding UTF8
Write-Host "Diff written: $outPath"
