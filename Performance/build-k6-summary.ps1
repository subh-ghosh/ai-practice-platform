param(
  [Parameter(Mandatory = $true)][string]$ResultsDir,
  [string]$OutputFile = "summary.md"
)

$ErrorActionPreference = "Stop"

function Convert-ToMs {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
  $v = $Value.Trim()
  if ($v -match "^([0-9]*\.?[0-9]+)(ns|us|ms|s)$") {
    $n = [double]$Matches[1]
    $u = $Matches[2]
    switch ($u) {
      "ns" { return $n / 1000000.0 }
      "us" { return $n / 1000.0 }
      "ms" { return $n }
      "s"  { return $n * 1000.0 }
    }
  }
  return $null
}

function Parse-ResultFile {
  param([string]$Path)

  $name = [System.IO.Path]::GetFileNameWithoutExtension($Path)
  $text = Get-Content -Path $Path -Raw

  $durationMatch = [regex]::Match(
    $text,
    "http_req_duration.*avg=([0-9]*\.?[0-9]+(?:ns|us|ms|s))\s+min=([0-9]*\.?[0-9]+(?:ns|us|ms|s))\s+med=([0-9]*\.?[0-9]+(?:ns|us|ms|s))\s+max=([0-9]*\.?[0-9]+(?:ns|us|ms|s))\s+p\(90\)=([0-9]*\.?[0-9]+(?:ns|us|ms|s))\s+p\(95\)=([0-9]*\.?[0-9]+(?:ns|us|ms|s))"
  )
  if (-not $durationMatch.Success) { return $null }

  $failed = [regex]::Match($text, "http_req_failed.*:\s*([^\r\n]+)")
  $checks = [regex]::Match($text, "checks_succeeded.*:\s*([^\r\n]+)")
  $reqs = [regex]::Match($text, "http_reqs.*:\s*([^\r\n]+)")

  [pscustomobject]@{
    Endpoint       = $name
    Avg            = $durationMatch.Groups[1].Value
    Min            = $durationMatch.Groups[2].Value
    Med            = $durationMatch.Groups[3].Value
    Max            = $durationMatch.Groups[4].Value
    P90            = $durationMatch.Groups[5].Value
    P95            = $durationMatch.Groups[6].Value
    Failed         = if ($failed.Success) { $failed.Groups[1].Value.Trim() } else { "" }
    ChecksSucceeded= if ($checks.Success) { $checks.Groups[1].Value.Trim() } else { "" }
    Reqs           = if ($reqs.Success) { $reqs.Groups[1].Value.Trim() } else { "" }
    AvgMs          = Convert-ToMs $durationMatch.Groups[1].Value
    P95Ms          = Convert-ToMs $durationMatch.Groups[6].Value
  }
}

$resolvedDir = (Resolve-Path $ResultsDir).Path
$txtFiles = Get-ChildItem -Path $resolvedDir -Filter *.txt | Sort-Object Name

if (-not $txtFiles) {
  throw "No .txt result files found in '$resolvedDir'."
}

$rows = @()
foreach ($f in $txtFiles) {
  $row = Parse-ResultFile -Path $f.FullName
  if ($null -ne $row) { $rows += $row }
}

if (-not $rows) {
  throw "Could not parse k6 metrics from .txt files in '$resolvedDir'."
}

$rows = $rows | Sort-Object Endpoint

$outPath = Join-Path $resolvedDir $OutputFile
$csvPath = Join-Path $resolvedDir "summary.csv"

$md = @()
$md += "# K6 Results Summary"
$md += ""
$md += "Results folder: $([System.IO.Path]::GetFileName($resolvedDir))"
$md += ""
$md += "| Endpoint | Avg | P95 | P90 | Med | Max | Failed | Checks Succeeded | Reqs |"
$md += "|---|---:|---:|---:|---:|---:|---:|---:|---:|"
foreach ($r in $rows) {
  $md += "| $($r.Endpoint) | $($r.Avg) | $($r.P95) | $($r.P90) | $($r.Med) | $($r.Max) | $($r.Failed) | $($r.ChecksSucceeded) | $($r.Reqs) |"
}

$mdText = $md -join [Environment]::NewLine
$mdWritten = $true
try {
  Set-Content -Path $outPath -Value $mdText -Encoding UTF8
} catch {
  $mdWritten = $false
  Write-Warning "Could not write markdown summary to '$outPath' (file may be open)."
}
$rows | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8

if ($mdWritten) {
  Write-Host "Summary written: $outPath"
}
Write-Host "CSV written: $csvPath"
