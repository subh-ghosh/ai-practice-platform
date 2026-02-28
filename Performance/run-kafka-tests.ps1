param(
    [Parameter(Mandatory=$true)][string]$BaseUrl,
    [Parameter(Mandatory=$true)][string]$Token,
    [string]$QuestionId = "1"
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $here ("results-kafka-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $outDir | Out-Null

Write-Host "🚀 Starting Kafka Performance Verification..." -ForegroundColor Cyan

# 1. Test Study Plan Generation (Asynchronous)
Write-Host "`n[1/2] Testing /api/study-plans/generate (Expected: < 500ms)..." -ForegroundColor Yellow
$log1 = Join-Path $outDir "study-plan-async.txt"
k6 run -e BASE_URL=$BaseUrl -e TOKEN=$Token -e VUS=1 -e DURATION=30s (Join-Path $here "resilience-studyplan-health.js") 2>&1 | Tee-Object -FilePath $log1

# 2. Test Quiz Submission (Asynchronous XP + Recovery Plans)
Write-Host "`n[2/3] Testing /api/practice/submit (Expected: Stable Latency)..." -ForegroundColor Yellow
$log2 = Join-Path $outDir "practice-submit-async.txt"
k6 run -e BASE_URL=$BaseUrl -e TOKEN=$Token -e QUESTION_ID=$QuestionId -e VUS=1 -e DURATION=30s (Join-Path $here "practice-submit.js") 2>&1 | Tee-Object -FilePath $log2

# 3. Test Profile Update (Asynchronous Notifications)
Write-Host "`n[3/3] Testing /api/students/profile (Expected: Rapid Response)..." -ForegroundColor Yellow
$log3 = Join-Path $outDir "profile-update-async.txt"
k6 run -e BASE_URL=$BaseUrl -e TOKEN=$Token -e VUS=1 -e DURATION=20s (Join-Path $here "profile-update.js") 2>&1 | Tee-Object -FilePath $log3

Write-Host "`n✅ Done! Results saved to: $outDir" -ForegroundColor Green
Write-Host "Performance coverage: Study Plans (AI), Gamification (XP), and Notifications."
