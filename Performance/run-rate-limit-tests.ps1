param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [ValidateSet("ai","ai-all","study-plans","both","all")][string]$Target = "all",
  [int]$AiVus = 10,
  [string]$AiDuration = "5m",
  [int]$StudyPlanVus = 5,
  [string]$StudyPlanDuration = "3m",
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [int]$Days = 7,
  [string]$CompareWithDir
)

$ErrorActionPreference = "Continue"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $here ("results-ratelimit-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $outDir | Out-Null

$scripts = @()
if ($Target -eq "ai" -or $Target -eq "both") {
  $scripts += [pscustomobject]@{
    Name = "rate-limit-ai-generate-question.js"
    Vus = $AiVus
    Duration = $AiDuration
  }
}
if ($Target -eq "ai-all" -or $Target -eq "all") {
  $scripts += [pscustomobject]@{ Name = "rate-limit-ai-generate-question.js"; Vus = $AiVus; Duration = $AiDuration }
  $scripts += [pscustomobject]@{ Name = "rate-limit-ai-get-hint.js"; Vus = $AiVus; Duration = $AiDuration }
  $scripts += [pscustomobject]@{ Name = "rate-limit-ai-get-answer.js"; Vus = $AiVus; Duration = $AiDuration }
}
if ($Target -eq "study-plans" -or $Target -eq "both") {
  $scripts += [pscustomobject]@{
    Name = "rate-limit-study-plans-generate.js"
    Vus = $StudyPlanVus
    Duration = $StudyPlanDuration
  }
}
if ($Target -eq "all") {
  $scripts += [pscustomobject]@{
    Name = "rate-limit-study-plans-generate.js"
    Vus = $StudyPlanVus
    Duration = $StudyPlanDuration
  }
}

foreach ($s in $scripts) {
  Write-Host "Running $($s.Name) ..."
  $log = Join-Path $outDir ($s.Name.Replace('.js', '.txt'))
  $cmd = @(
    "run",
    "-e", "BASE_URL=$BaseUrl",
    "-e", "TOKEN=$Token",
    "-e", "TOPIC=$Topic",
    "-e", "DIFFICULTY=$Difficulty",
    "-e", "DAYS=$Days",
    "-e", "VUS=$($s.Vus)",
    "-e", "DURATION=$($s.Duration)",
    (Join-Path $here $s.Name)
  )
  & k6 @cmd 2>&1 | Tee-Object -FilePath $log
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "k6 exited with code $LASTEXITCODE for $($s.Name). Continuing."
  }
}

& (Join-Path $here "build-k6-summary.ps1") -ResultsDir $outDir

if ($CompareWithDir) {
  & (Join-Path $here "build-k6-diff.ps1") -BeforeDir $CompareWithDir -AfterDir $outDir
}

Write-Host "Rate-limit test run complete: $outDir"
