# Resilience Health Summary

Results folder: results-resilience-health-after-20260227-160627

Overall status: **ACTION_NEEDED**

## Thresholds

- P95 target (ms): 4000
- Max HTTP failed rate: 0.2
- Max blocked rate (429+503): 0.2

## Current Run

| Metric | Value |
|---|---:|
| Requests | 104 |
| Avg latency (ms) | 77.83 |
| P95 latency (ms) | 128.22 |
| HTTP failed rate | 1 |
| status=200 | 0 |
| status=429 | 104 |
| status=503 | 0 |
| status=other | 0 |
| blocked rate (429+503) | 1 |

## Gate Checks

- Frequent 503 in test window: False
- P95 above target: False
- HTTP failed rate above target: True
- Blocked rate above target: True

## Before vs After (CV-Ready)

| Metric | Before | After | Delta |
|---|---:|---:|---:|
| Avg latency (ms) | 2226.75 | 77.83 | -2148.92 |
| P95 latency (ms) | 6599.4 | 128.22 | -6471.18 |
| HTTP failed rate | 0.5455 | 1 | 0.4545 |
| status=429 | 12 | 104 | 92 |
| status=503 | 0 | 0 | 0 |
