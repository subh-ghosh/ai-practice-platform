# Resilience Health Checks (Study Plan)

This flow directly answers 3 gates:

1. Frequent `503`?
2. P95 above target?
3. Before/after metrics for CV?

## 1) Run baseline

```powershell
cd "C:\Users\subar\OneDrive\Desktop\PracticeFlow– Adaptive Learning SaaS Platform\ai-practice-platform\Performance"
$token="YOUR_JWT"
.\run-resilience-health-check.ps1 `
  -BaseUrl "https://ai-practice-platform-ep13.onrender.com" `
  -Token $token `
  -Duration "1m" `
  -Vus 1 `
  -OutputDir ("results-resilience-health-before-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
```

## 2) Run after change

```powershell
cd "C:\Users\subar\OneDrive\Desktop\PracticeFlow– Adaptive Learning SaaS Platform\ai-practice-platform\Performance"
$token="YOUR_JWT"
.\run-resilience-health-check.ps1 `
  -BaseUrl "https://ai-practice-platform-ep13.onrender.com" `
  -Token $token `
  -Duration "1m" `
  -Vus 1 `
  -OutputDir ("results-resilience-health-after-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
```

## 3) Build threshold + CV summary

```powershell
cd "C:\Users\subar\OneDrive\Desktop\PracticeFlow– Adaptive Learning SaaS Platform\ai-practice-platform\Performance"
.\build-resilience-health-report.ps1 `
  -ResultsDir ".\results-resilience-health-after-YYYYMMDD-HHMMSS" `
  -BaselineDir ".\results-resilience-health-before-YYYYMMDD-HHMMSS" `
  -P95TargetMs 4000 `
  -MaxFailureRate 0.20 `
  -MaxBlockedRate 0.20
```

Outputs in `ResultsDir`:

- `resilience-health-summary.md`
- `resilience-health-metrics.csv`
- `studyplan-health-summary.json`
- `studyplan-health.txt`

## Optional Grafana checks (same 10m/15m window)

```promql
sum(increase(http_server_requests_seconds_count{uri="/api/study-plans/generate",status="503"}[15m])) or vector(0)
```

```promql
histogram_quantile(0.95, sum by (le) (rate(http_server_requests_seconds_bucket{uri="/api/study-plans/generate"}[5m])))
```

```promql
sum(increase(http_server_requests_seconds_count{uri="/api/study-plans/generate"}[15m])) or vector(0)
```
