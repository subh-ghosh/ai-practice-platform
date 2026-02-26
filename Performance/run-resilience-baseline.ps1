param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [string]$Subtopic = "OOP",
  [int]$AiIterations = 25,
  [int]$StudyPlanIterations = 6,
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $OutputDir = "results-resilience-baseline-$ts"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

function Run-K6Test {
  param(
    [Parameter(Mandatory = $true)][string]$Script,
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
    "--vus", "1",
    "--iterations", "$Iterations",
    "--summary-export", $SummaryFile
  )

  & k6 @cmd 2>&1 | Tee-Object -FilePath $LogFile
}

Run-K6Test -Script ".\rate-limit-ai-generate-question.js" `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-generate-question-summary.json" `
  -LogFile "$OutputDir\ai-generate-question.txt"

Run-K6Test -Script ".\rate-limit-ai-get-hint.js" `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-get-hint-summary.json" `
  -LogFile "$OutputDir\ai-get-hint.txt"

Run-K6Test -Script ".\rate-limit-ai-get-answer.js" `
  -Iterations $AiIterations `
  -SummaryFile "$OutputDir\ai-get-answer-summary.json" `
  -LogFile "$OutputDir\ai-get-answer.txt"

Run-K6Test -Script ".\rate-limit-study-plans-generate.js" `
  -Iterations $StudyPlanIterations `
  -SummaryFile "$OutputDir\study-plans-generate-summary.json" `
  -LogFile "$OutputDir\study-plans-generate.txt"

Write-Host ""
Write-Host "Baseline completed."
Write-Host "Results folder: $OutputDir"
