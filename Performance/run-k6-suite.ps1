param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [Parameter(Mandatory = $true)][string]$Token,
  [ValidateSet("before","after")][string]$Label = "before",
  [string]$PlanId,
  [string]$ItemId,
  [string]$Topic = "Java",
  [string]$Difficulty = "Beginner",
  [int]$Vus = 20,
  [string]$Duration = "1m",
  [switch]$Warmup,
  [int]$WarmupVus = 5,
  [string]$WarmupDuration = "1m",
  [string]$CompareWithDir
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

$runArgs = @{
  BaseUrl        = $BaseUrl
  Token          = $Token
  Topic          = $Topic
  Difficulty     = $Difficulty
  Vus            = $Vus
  Duration       = $Duration
  WarmupVus      = $WarmupVus
  WarmupDuration = $WarmupDuration
}

if ($PlanId) { $runArgs.PlanId = $PlanId }
if ($ItemId) { $runArgs.ItemId = $ItemId }
if ($Warmup) { $runArgs.Warmup = $true }

$beforeDirs = Get-ChildItem -Path $here -Directory | Where-Object { $_.Name -like "results-*" }
& (Join-Path $here "run-all-read-tests.ps1") @runArgs
$afterDirs = Get-ChildItem -Path $here -Directory | Where-Object { $_.Name -like "results-*" }

$newDir = Compare-Object -ReferenceObject $beforeDirs.FullName -DifferenceObject $afterDirs.FullName |
  Where-Object { $_.SideIndicator -eq "=>" } |
  Select-Object -First 1 -ExpandProperty InputObject

if (-not $newDir) {
  throw "Could not detect newly created results directory."
}

$labelledDir = Join-Path $here ((Split-Path $newDir -Leaf) + " " + $Label.ToUpper())
if (Test-Path $labelledDir) { Remove-Item -Path $labelledDir -Recurse -Force }
Rename-Item -Path $newDir -NewName (Split-Path $labelledDir -Leaf)

& (Join-Path $here "build-k6-summary.ps1") -ResultsDir $labelledDir

if ($CompareWithDir) {
  & (Join-Path $here "build-k6-diff.ps1") -BeforeDir $CompareWithDir -AfterDir $labelledDir
}

Write-Host "Run complete: $labelledDir"
