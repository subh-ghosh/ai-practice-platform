# Resilience Baseline Metrics (Before Resilience4j)

Captured folder: `results-resilience-baseline-20260226-213558`

## Endpoint Summary
- ai-generate-question: avg 128.30 ms, p95 318.00 ms, max 565.95 ms, failed 20.00% (20/25 checks passed)
- ai-get-hint: avg 114.19 ms, p95 299.77 ms, max 336.28 ms, failed 0.00% (25/25 checks passed)
- ai-get-answer: avg 112.51 ms, p95 292.58 ms, max 467.55 ms, failed 0.00% (25/25 checks passed)
- study-plans-generate: avg 4500.00 ms, p95 7420.00 ms, max 8200.00 ms, failed 0.00% (6/6 checks passed)

## Notes
- This is the "before" snapshot for Resilience4j comparison.
- `ai-generate-question` failures are expected under current rate-limit pressure (200/429 checks).
- Keep test profile identical for after-run (same iterations and token setup).
