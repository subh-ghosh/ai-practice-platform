# CV Points - Rate Limiting and Observability

Use these as bullet points in your resume/project section.

- Implemented production-grade API rate limiting in a Spring Boot SaaS backend using Bucket4j (per-user + IP fallback) across AI and study-plan generation endpoints.
- Designed endpoint-level throttling policy (AI: 60/min user, 20/min IP; study-plan generation: 10/hour user, 3/hour IP) with HTTP 429 + `Retry-After` for graceful enforcement.
- Added observability with Micrometer + Prometheus + Grafana Cloud and exposed custom metrics (`rate_limit_allowed_total`, `rate_limit_blocked_total`, cache-layer metrics, latency/throughput panels).
- Built repeatable performance test automation (k6 + PowerShell) and baseline/after comparison artifacts (`summary.csv`, `summary.md`, diff reports).
- Quantified abuse protection impact from baseline to enforced policy (15-minute window): allowed requests reduced **21,270 -> 550** and blocked requests increased **0 -> 14,687**, proving effective burst containment.
- Improved platform reliability posture by coupling cache strategy (Caffeine L1 + Redis L2) with request governance and metrics-driven validation.

## One-line project description
Built and benchmarked a Spring Boot learning platform backend with two-layer caching, endpoint-aware Bucket4j rate limiting, and Grafana Cloud observability, validated through automated k6 before/after test suites.
