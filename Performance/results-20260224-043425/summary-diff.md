# K6 Results Diff (Before vs After)

Before: results-20260223-235842

After: results-20260224-043425

| Endpoint | Avg (Before) | Avg (After) | Avg ? ms | P95 (Before) | P95 (After) | P95 ? ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 121.13ms | 112.05ms | -9.08 | 201.23ms | 150.07ms | -51.16 |
| courses-list | 146.47ms | 119.46ms | -27.01 | 281ms | 193.94ms | -87.06 |
| gamification-badges | 155.26ms | 345.36ms | 190.1 | 287.91ms | 949.53ms | 661.62 |
| gamification-daily-challenges | 150.25ms | 188.72ms | 38.47 | 295ms | 498.09ms | 203.09 |
| notifications-all | 181.62ms | 135.44ms | -46.18 | 374.95ms | 203.2ms | -171.75 |
| notifications-unread | 166.06ms | 103.64ms | -62.42 | 315.91ms | 144.91ms | -171 |
| practice-history | 207.75ms | 119.62ms | -88.13 | 651.58ms | 205.59ms | -445.99 |
| practice-suggestion | 176.56ms | 100.75ms | -75.81 | 411.98ms | 134.27ms | -277.71 |
| recommendations-ai-coach | 140.56ms | 115.04ms | -25.52 | 264.57ms | 177.25ms | -87.32 |
| recommendations-dashboard | 147.34ms | 104.37ms | -42.97 | 301.46ms | 141.21ms | -160.25 |
| recommendations-predict | 136.52ms | 113.79ms | -22.73 | 233.92ms | 157.77ms | -76.15 |
| stats-recommendations | 124.94ms | 120.28ms | -4.66 | 200.42ms | 198.55ms | -1.87 |
| stats-summary | 120.38ms | 120.67ms | 0.29 | 197.34ms | 186.39ms | -10.95 |
| stats-timeseries | 126.86ms | 120.48ms | -6.38 | 199.41ms | 194.21ms | -5.2 |
| stats-xp-history | 131.19ms | 119.11ms | -12.08 | 241.95ms | 192.57ms | -49.38 |
| students-leaderboard | 109.7ms | 124.11ms | 14.41 | 191.35ms | 199.35ms | 8 |
| students-profile | 148.87ms | 111.16ms | -37.71 | 394.84ms | 159.48ms | -235.36 |
| study-plan-by-id | 109.9ms | 124.79ms | 14.89 | 156.85ms | 194.74ms | 37.89 |
| study-plan-quiz | 103.02ms | 115.09ms | 12.07 | 133.39ms | 160.05ms | 26.66 |
| study-plans-active-context | 120.15ms | 115.85ms | -4.3 | 201.37ms | 176.7ms | -24.67 |
| study-plans-list | 119.99ms | 1.1s | 980.01 | 201.77ms | 2.82s | 2618.23 |
| study-plans-stats | 124.14ms | 111.33ms | -12.81 | 202.22ms | 164.91ms | -37.31 |
