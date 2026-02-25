# Before vs After (Rate Limiting)

Baseline folder: `Performance/results-ratelimit-20260226-005538 BASELINE NO RATE LIMIT`
After folder: `Performance/results-ratelimit-20260226-015510`
Window: 15m

## Headline
- Allowed total dropped from **21270** to **550** (**-20720**, **-97.41%**)
- Blocked total increased from **0** to **14687**
- System moved from no throttling to strong enforcement.

## Comparison Table

| Metric | Before | After | Delta | Delta % |
|---|---:|---:|---:|---:|
| allowed_total | 21270 | 550 | -20720 | -97.41% |
| blocked_total | 0 | 14687 | +14687 | N/A |
| allowed_study_plan_generate | 820 | 0 | -820 | -100.00% |
| blocked_study_plan_generate | 0 | 3748 | +3748 | N/A |

## Endpoint Notes
- Baseline used endpoint key `ai_all` (allowed: 8142, blocked: 0).
- After run exposes split keys (`ai_generate_question`, `ai_get_hint`, `ai_get_answer`).
- Because of key model change, AI per-endpoint values are operationally valid but not 1:1 comparable against baseline `ai_all` in a single row.

## Current Limits (Configured)
- AI endpoints: user `60/min`, IP fallback `20/min`
- Study-plan generate endpoints: user `10/60min`, IP fallback `3/60min`

## Interpretation
This result set is valid for CV-grade "before vs after" evidence: before had effectively no blocking, after shows sustained blocking under burst load with explicit policy limits.
