param(
  [Parameter(Mandatory = $true)][string]$ResultsDir,
  [string]$BaselineDir = "",
  [double]$P95TargetMs = 4000,
  [double]$MaxFailureRate = 0.20,
  [double]$MaxBlockedRate = 0.20,
  [string]$OutputFile = "resilience-health-summary.md"
)

$ErrorActionPreference = "Stop"

function Read-JsonFile {
  param([Parameter(Mandatory = $true)][string]$Path)
  return Get-Content -Path $Path -Raw | ConvertFrom-Json
}

function Get-MetricValue {
  param(
    [Parameter(Mandatory = $true)]$Metrics,
    [Parameter(Mandatory = $true)][string]$Name
  )
  if ($null -eq $Metrics.$Name) { return 0.0 }
  if ($null -ne $Metrics.$Name.value) { return [double]$Metrics.$Name.value }
  if ($null -ne $Metrics.$Name.count) { return [double]$Metrics.$Name.count }
  return 0.0
}

function Build-Row {
  param([Parameter(Mandatory = $true)]$SummaryJson)

  $m = $SummaryJson.metrics
  $reqCount = Get-MetricValue -Metrics $m -Name "http_reqs"

  $status200 = Get-MetricValue -Metrics $m -Name "study_plans_status_200_total"
  $status429 = Get-MetricValue -Metrics $m -Name "study_plans_status_429_total"
  $status503 = Get-MetricValue -Metrics $m -Name "study_plans_status_503_total"
  $statusOther = Get-MetricValue -Metrics $m -Name "study_plans_status_other_total"

  $p95 = [double]$m.http_req_duration.'p(95)'
  $avg = [double]$m.http_req_duration.avg
  $failRate = [double]$m.http_req_failed.value

  $blockedRate = 0.0
  if ($reqCount -gt 0) {
    $blockedRate = ($status429 + $status503) / $reqCount
  }

  return [pscustomobject]@{
    Requests = $reqCount
    AvgMs = [math]::Round($avg, 2)
    P95Ms = [math]::Round($p95, 2)
    HttpFailedRate = [math]::Round($failRate, 4)
    Status200 = $status200
    Status429 = $status429
    Status503 = $status503
    StatusOther = $statusOther
    BlockedRate = [math]::Round($blockedRate, 4)
  }
}

$resultsPath = (Resolve-Path $ResultsDir).Path
$summaryPath = Join-Path $resultsPath "studyplan-health-summary.json"
if (-not (Test-Path $summaryPath)) {
  throw "Missing summary file: $summaryPath"
}

$afterJson = Read-JsonFile -Path $summaryPath
$after = Build-Row -SummaryJson $afterJson

$before = $null
if (-not [string]::IsNullOrWhiteSpace($BaselineDir)) {
  $basePath = (Resolve-Path $BaselineDir).Path
  $baseSummary = Join-Path $basePath "studyplan-health-summary.json"
  if (-not (Test-Path $baseSummary)) {
    throw "Baseline summary not found: $baseSummary"
  }
  $beforeJson = Read-JsonFile -Path $baseSummary
  $before = Build-Row -SummaryJson $beforeJson
}

$flagFrequent503 = ($after.Status503 -gt 0)
$flagHighP95 = ($after.P95Ms -gt $P95TargetMs)
$flagHighFailure = ($after.HttpFailedRate -gt $MaxFailureRate)
$flagHighBlocked = ($after.BlockedRate -gt $MaxBlockedRate)

$status = "PASS"
if ($flagFrequent503 -or $flagHighP95 -or $flagHighFailure -or $flagHighBlocked) {
  $status = "ACTION_NEEDED"
}

$lines = @()
$lines += "# Resilience Health Summary"
$lines += ""
$lines += "Results folder: $([System.IO.Path]::GetFileName($resultsPath))"
$lines += ""
$lines += "Overall status: **$status**"
$lines += ""
$lines += "## Thresholds"
$lines += ""
$lines += "- P95 target (ms): $P95TargetMs"
$lines += "- Max HTTP failed rate: $MaxFailureRate"
$lines += "- Max blocked rate (429+503): $MaxBlockedRate"
$lines += ""
$lines += "## Current Run"
$lines += ""
$lines += "| Metric | Value |"
$lines += "|---|---:|"
$lines += "| Requests | $($after.Requests) |"
$lines += "| Avg latency (ms) | $($after.AvgMs) |"
$lines += "| P95 latency (ms) | $($after.P95Ms) |"
$lines += "| HTTP failed rate | $($after.HttpFailedRate) |"
$lines += "| status=200 | $($after.Status200) |"
$lines += "| status=429 | $($after.Status429) |"
$lines += "| status=503 | $($after.Status503) |"
$lines += "| status=other | $($after.StatusOther) |"
$lines += "| blocked rate (429+503) | $($after.BlockedRate) |"
$lines += ""
$lines += "## Gate Checks"
$lines += ""
$lines += "- Frequent 503 in test window: $flagFrequent503"
$lines += "- P95 above target: $flagHighP95"
$lines += "- HTTP failed rate above target: $flagHighFailure"
$lines += "- Blocked rate above target: $flagHighBlocked"

if ($null -ne $before) {
  $lines += ""
  $lines += "## Before vs After (CV-Ready)"
  $lines += ""
  $lines += "| Metric | Before | After | Delta |"
  $lines += "|---|---:|---:|---:|"
  $lines += "| Avg latency (ms) | $($before.AvgMs) | $($after.AvgMs) | $([math]::Round($after.AvgMs - $before.AvgMs, 2)) |"
  $lines += "| P95 latency (ms) | $($before.P95Ms) | $($after.P95Ms) | $([math]::Round($after.P95Ms - $before.P95Ms, 2)) |"
  $lines += "| HTTP failed rate | $($before.HttpFailedRate) | $($after.HttpFailedRate) | $([math]::Round($after.HttpFailedRate - $before.HttpFailedRate, 4)) |"
  $lines += "| status=429 | $($before.Status429) | $($after.Status429) | $([math]::Round($after.Status429 - $before.Status429, 2)) |"
  $lines += "| status=503 | $($before.Status503) | $($after.Status503) | $([math]::Round($after.Status503 - $before.Status503, 2)) |"
}

$reportPath = Join-Path $resultsPath $OutputFile
Set-Content -Path $reportPath -Value ($lines -join [Environment]::NewLine) -Encoding UTF8

$csvPath = Join-Path $resultsPath "resilience-health-metrics.csv"
$rows = @()
$rows += [pscustomobject]@{
  Run = "after"
  Requests = $after.Requests
  AvgMs = $after.AvgMs
  P95Ms = $after.P95Ms
  HttpFailedRate = $after.HttpFailedRate
  Status200 = $after.Status200
  Status429 = $after.Status429
  Status503 = $after.Status503
  StatusOther = $after.StatusOther
  BlockedRate = $after.BlockedRate
}
if ($null -ne $before) {
  $rows += [pscustomobject]@{
    Run = "before"
    Requests = $before.Requests
    AvgMs = $before.AvgMs
    P95Ms = $before.P95Ms
    HttpFailedRate = $before.HttpFailedRate
    Status200 = $before.Status200
    Status429 = $before.Status429
    Status503 = $before.Status503
    StatusOther = $before.StatusOther
    BlockedRate = $before.BlockedRate
  }
}
$rows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

Write-Host "Report written: $reportPath"
Write-Host "CSV written: $csvPath"
