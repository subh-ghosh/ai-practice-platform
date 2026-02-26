param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [string]$Subtopic = "OOP",
  [int]$AiVus = 2,
  [int]$AiIterations = 80,
  [int]$StudyPlanVus = 1,
  [int]$StudyPlanIterations = 10,
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $OutputDir = "results-resilience-baseline-stress-$ts"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

function Run-K6Stress {
  param(
    [Parameter(Mandatory = $true)][string]$Script,
    [Parameter(Mandatory = $true)][int]$Vus,
    [Parameter(Mandatory = $true)][int]$Iterations,
    [Parameter(Mandatory = $true)][string]$SummaryFile,
    [Parameter(Mandatory = $true)][string]$LogFile
  )

  $cmd = @(
    "run", $Script,
    "-e", "BASE_URL=$BaseUrl",
    "-e", "TOKEN=$Token",
    "-e", "TOPIC=$Topic",
    "-e", "DIFFICULTY=$Difficulty",
    "-e", "SUBTOPIC=$Subtopic",
    "--vus", "$Vus",
    "--iterations", "$Iterations",
    "--summary-export", $SummaryFile
  )

  & k6 @cmd 2>&1 | Tee-Object -FilePath $LogFile
}

Run-K6Stress -Script ".\rate-limit-ai-generate-question.js" `
  -Vus $AiVus `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-generate-question-summary.json" `
  -LogFile "$OutputDir\ai-generate-question.txt"

Run-K6Stress -Script ".\rate-limit-ai-get-hint.js" `
  -Vus $AiVus `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-get-hint-summary.json" `
  -LogFile "$OutputDir\ai-get-hint.txt"

Run-K6Stress -Script ".\rate-limit-ai-get-answer.js" `
  -Vus $AiVus `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-get-answer-summary.json" `
  -LogFile "$OutputDir\ai-get-answer.txt"

Run-K6Stress -Script ".\rate-limit-study-plans-generate.js" `
  -Vus $StudyPlanVus `
  -Iterations $StudyPlanIterations `
  -SummaryFile "$OutputDir\study-plans-generate-summary.json" `
  -LogFile "$OutputDir\study-plans-generate.txt"

Write-Host ""
Write-Host "Stress baseline completed."
Write-Host "Results folder: $OutputDir"
