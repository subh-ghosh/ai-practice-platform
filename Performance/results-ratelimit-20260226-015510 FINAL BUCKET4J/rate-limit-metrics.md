# Rate-Limit Metrics (After Bucket4j)

Captured: 2026-02-26
Window: 15m
Run label: after_bucket4j

## Totals
- allowed_total: 550
- blocked_total: 14687
- total_attempted: 15237
- allow_rate: 3.61%
- block_rate: 96.39%

## Allowed By Endpoint
- ai_generate_question: 1.07
- ai_get_hint: 136
- ai_get_answer: 259
- study_plan_generate: 0

## Blocked By Endpoint
- ai_generate_question: 0
- ai_get_hint: 8155
- ai_get_answer: 0
- study_plan_generate: 3748

## Queries Used
- `sum(increase(rate_limit_allowed_total[15m])) or vector(0)`
- `sum(increase(rate_limit_blocked_total[15m])) or vector(0)`
- `sum by (endpoint) (increase(rate_limit_allowed_total[15m])) or vector(0)`
- `sum by (endpoint) (increase(rate_limit_blocked_total[15m])) or vector(0)`

Note: Prometheus `increase(...)` can return fractional values due interpolation.
