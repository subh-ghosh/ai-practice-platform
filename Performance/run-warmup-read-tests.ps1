param(
  [Parameter(Mandatory=$true)][string]$BaseUrl,
  [Parameter(Mandatory=$true)][string]$Token,
  [string]$PlanId,
  [string]$ItemId,
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [int]$Vus = 5,
  [string]$Duration = "1m"
)

$ErrorActionPreference = "Continue"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $here ("warmup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $outDir | Out-Null

$scripts = @(
  "courses-list.js",
  "courses-auth-check.js",
  "gamification-badges.js",
  "gamification-daily-challenges.js",
  "notifications-all.js",
  "notifications-unread.js",
  "practice-history.js",
  "practice-suggestion.js",
  "recommendations-dashboard.js",
  "recommendations-predict.js",
  "recommendations-ai-coach.js",
  "stats-summary.js",
  "stats-timeseries.js",
  "stats-xp-history.js",
  "stats-recommendations.js",
  "study-plans-list.js",
  "study-plans-stats.js",
  "study-plans-active-context.js",
  "students-profile.js",
  "students-leaderboard.js"
)

if ($PlanId) { $scripts += "study-plan-by-id.js" }
if ($PlanId -and $ItemId) { $scripts += "study-plan-quiz.js" }

foreach ($s in $scripts) {
  Write-Host "Warming $s ..."
  $log = Join-Path $outDir ($s.Replace('.js','.txt'))
  $cmd = @(
    "run",
    "-e", "BASE_URL=$BaseUrl",
    "-e", "TOKEN=$Token",
    "-e", "PLAN_ID=$PlanId",
    "-e", "ITEM_ID=$ItemId",
    "-e", "TOPIC=$Topic",
    "-e", "DIFFICULTY=$Difficulty",
    "-e", "VUS=$Vus",
    "-e", "DURATION=$Duration",
    (Join-Path $here $s)
  )
  & k6 @cmd 2>&1 | Tee-Object -FilePath $log
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "k6 exited with code $LASTEXITCODE for $s. Continuing."
  }
}

Write-Host "Warmup done. Folder: $outDir"
