# Rate-Limit Baseline Metrics (No Blocking)

Captured: 2026-02-26
Window: 15m
Run label: baseline_no_rate_limit

## Totals
- allowed_total: 21270
- blocked_total: 0

## Allowed By Endpoint
- ai_all: 8142
- study_plan_generate: 820

## Blocked By Endpoint
- none (0)

## Queries Used
- `sum(increase(rate_limit_allowed_total[15m])) or vector(0)`
- `sum(increase(rate_limit_blocked_total[15m])) or vector(0)`
- `sum by (endpoint) (increase(rate_limit_allowed_total[15m])) or vector(0)`
- `sum by (endpoint) (increase(rate_limit_blocked_total[15m])) or vector(0)`
