param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [int]$Vus = 1,
  [string]$Duration = "1m",
  [double]$SleepSeconds = 0.5,
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $OutputDir = "results-resilience-health-$ts"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$summary = Join-Path $OutputDir "studyplan-health-summary.json"
$log = Join-Path $OutputDir "studyplan-health.txt"

$cmd = @(
  "run", ".\resilience-studyplan-health.js",
  "-e", "BASE_URL=$BaseUrl",
  "-e", "TOKEN=$Token",
  "-e", "TOPIC=$Topic",
  "-e", "DIFFICULTY=$Difficulty",
  "-e", "VUS=$Vus",
  "-e", "DURATION=$Duration",
  "-e", "SLEEP_SECONDS=$SleepSeconds",
  "--vus", "$Vus",
  "--duration", "$Duration",
  "--summary-export", $summary
)

& k6 @cmd 2>&1 | Tee-Object -FilePath $log

Write-Host ""
Write-Host "Health test completed."
Write-Host "Results folder: $OutputDir"
