# Before vs After (Tuned) - Resilience4j

Before: `results-resilience-baseline-stress-20260226-220430`
After tuned: `results-resilience-after-tuned-20260227-002932`

| Endpoint | Metric | Before | After Tuned | Delta | Delta % |
|---|---|---:|---:|---:|---:|
| ai-generate-question | avg_ms | 145.47 | 626.32 | +480.85 | +330.55% |
| ai-generate-question | p95_ms | 262.35 | 763.13 | +500.78 | +190.88% |
| ai-generate-question | http_req_failed_% | 11.25 | 0.00 | -11.25 | -100.00% |
| ai-get-hint | avg_ms | 89.25 | 329.92 | +240.67 | +269.66% |
| ai-get-hint | p95_ms | 170.09 | 558.72 | +388.63 | +228.48% |
| ai-get-hint | http_req_failed_% | 11.11 | 0.00 | -11.11 | -100.00% |
| ai-get-answer | avg_ms | 104.26 | 295.96 | +191.70 | +183.86% |
| ai-get-answer | p95_ms | 175.00 | 531.51 | +356.51 | +203.72% |
| ai-get-answer | http_req_failed_% | 9.87 | 1.23 | -8.64 | -87.54% |
| study-plans-generate | avg_ms | 3020.00 | 2150.00 | -870.00 | -28.81% |
| study-plans-generate | p95_ms | 5760.00 | 7860.00 | +2100.00 | +36.46% |
| study-plans-generate | http_req_failed_% | 20.00 | 70.00 | +50.00 | +250.00% |

## Simple Conclusion
- Resilience tuning improved AI endpoint reliability significantly (failed requests dropped sharply).
- Tradeoff remains: AI latency increased compared to baseline.
- Study-plan generation is still unstable under stress and needs dedicated, stricter resilience profile and/or request load reduction.
