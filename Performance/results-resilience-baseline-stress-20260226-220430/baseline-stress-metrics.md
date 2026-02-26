# Resilience Baseline Metrics (Stress, Before Resilience4j)

Captured folder: `results-resilience-baseline-stress-20260226-220430`

## Endpoint Summary
- ai-generate-question: avg 145.47 ms, p95 262.35 ms, max 1660.00 ms, http_req_failed 11.25%, checks_failed 2.50%
- ai-get-hint: avg 89.25 ms, p95 170.09 ms, max 262.06 ms, http_req_failed 11.11%, checks_failed 0.00%
- ai-get-answer: avg 104.26 ms, p95 175.00 ms, max 629.09 ms, http_req_failed 9.87%, checks_failed 0.00%
- study-plans-generate: avg 3020.00 ms, p95 5760.00 ms, max 6570.00 ms, http_req_failed 20.00%, checks_failed 0.00%

## Notes
- This is the official stress baseline for before/after Resilience4j comparison.
- `http_req_failed` includes non-2xx responses; checks still pass when statuses are in expected ranges (for example 200/429 or 200/403/429).
- Run after-Resilience tests with the same script and parameters for valid comparison.
