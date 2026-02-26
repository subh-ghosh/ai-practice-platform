# Before vs After Summary (Resilience4j)

Before: `results-resilience-baseline-stress-20260226-220430`
After: `results-resilience-after-20260226-224237`
Profile: same stress script (`run-resilience-baseline-stress.ps1`)

## Comparison Table

| Endpoint | Metric | Before | After | Delta | Delta % |
|---|---|---:|---:|---:|---:|
| ai-generate-question | avg_ms | 145.47 | 1080.00 | +934.53 | +642.77% |
| ai-generate-question | p95_ms | 262.35 | 812.92 | +550.57 | +209.86% |
| ai-generate-question | http_req_failed_% | 11.25 | 0.00 | -11.25 | -100.00% |
| ai-get-hint | avg_ms | 89.25 | 287.26 | +198.01 | +221.86% |
| ai-get-hint | p95_ms | 170.09 | 557.31 | +387.22 | +227.65% |
| ai-get-hint | http_req_failed_% | 11.11 | 1.23 | -9.88 | -88.93% |
| ai-get-answer | avg_ms | 104.26 | 244.48 | +140.22 | +134.49% |
| ai-get-answer | p95_ms | 175.00 | 421.46 | +246.46 | +140.83% |
| ai-get-answer | http_req_failed_% | 9.87 | 3.70 | -6.17 | -62.51% |
| study-plans-generate | avg_ms | 3020.00 | 2160.00 | -860.00 | -28.48% |
| study-plans-generate | p95_ms | 5760.00 | 7620.00 | +1860.00 | +32.29% |
| study-plans-generate | http_req_failed_% | 20.00 | 70.00 | +50.00 | +250.00% |

## Interpretation
- Reliability improved on AI endpoints by reducing transport-level failed requests.
- Latency increased significantly because retries/circuit behavior adds protective overhead under current load.
- Study-plan endpoint check was updated to include 503; failed checks dropped, but significant non-expected 5xx responses still exist under stress.

## Action required for next tuning cycle
- Capture exact status distribution (by status code) for `study-plans-generate` during stress.
- Tune resilience values (timeout, retry, bulkhead) to reduce non-expected 5xx while keeping latency acceptable.
