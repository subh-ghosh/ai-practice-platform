# Resilience After Metrics (Post-Resilience4j)

Captured folder: `results-resilience-after-20260226-224237`
Compared against baseline: `results-resilience-baseline-stress-20260226-220430`

## Endpoint Summary
- ai-generate-question: avg 1080.00 ms, p95 812.92 ms, max 25790.00 ms, http_req_failed 0.00%, checks_failed 0.00%
- ai-get-hint: avg 287.26 ms, p95 557.31 ms, max 972.23 ms, http_req_failed 1.23%, checks_failed 0.00%
- ai-get-answer: avg 244.48 ms, p95 421.46 ms, max 1160.00 ms, http_req_failed 3.70%, checks_failed 0.00%
- study-plans-generate: avg 2160.00 ms, p95 7620.00 ms, max 8620.00 ms, http_req_failed 70.00%, checks_failed 40.00%

## Important note
`study-plans-generate` check now includes 503. Remaining failed checks mean some responses are still outside `200/403/429/503` (likely 5xx variants under stress).
