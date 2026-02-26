# Resilience After-Tuned Metrics

Captured folder: `results-resilience-after-tuned-20260227-002932`
Baseline folder: `results-resilience-baseline-stress-20260226-220430`

## Endpoint Summary
- ai-generate-question: avg 626.32 ms, p95 763.13 ms, max 8770.00 ms, http_req_failed 0.00%, checks_failed 0.00%
- ai-get-hint: avg 329.92 ms, p95 558.72 ms, max 1010.00 ms, http_req_failed 0.00%, checks_failed 0.00%
- ai-get-answer: avg 295.96 ms, p95 531.51 ms, max 948.02 ms, http_req_failed 1.23%, checks_failed 0.00%
- study-plans-generate: avg 2150.00 ms, p95 7860.00 ms, max 8820.00 ms, http_req_failed 70.00%, checks_failed 70.00%

## Readout
- AI endpoints are now stable on checks and mostly stable on transport failures.
- Study-plan generation remains the critical unstable endpoint under stress.
