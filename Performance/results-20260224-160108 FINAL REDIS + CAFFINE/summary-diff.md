# K6 Results Diff (Before vs After)

Before: results-20260222-165555 PRIOR CACHING

After: results-20260224-160108 FINAL REDIS + CAFFINE

| Endpoint | Avg (Before) | Avg (After) | Avg Delta ms | P95 (Before) | P95 (After) | P95 Delta ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 195.71ms | 65.64ms | 65.64 | 594.14ms | 80.26ms | 80.26 |
| courses-list | 434.76ms | 66.53ms | 66.53 | 1.14s | 80.92ms | 80.92 |
| gamification-badges | 129.8ms | 74.41ms | 74.41 | 416.5ms | 97.92ms | 97.92 |
| gamification-daily-challenges | 135.86ms | 71.26ms | 71.26 | 421.08ms | 95.36ms | 95.36 |
| notifications-all | 87.79ms | 71.92ms | 71.92 | 150.54ms | 95.38ms | 95.38 |
| notifications-unread | 132.47ms | 71.4ms | 71.4 | 386.77ms | 96.09ms | 96.09 |
| practice-history | 217.12ms | 87.49ms | 87.49 | 885.79ms | 124.98ms | 124.98 |
| practice-suggestion | 188.89ms | 70.9ms | 70.9 | 802.77ms | 94.06ms | 94.06 |
| recommendations-ai-coach | 433.8ms | 74.35ms | 74.35 | 1.3s | 102.53ms | 102.53 |
| recommendations-dashboard | 274.52ms | 69.98ms | 69.98 | 1.02s | 93.23ms | 93.23 |
| recommendations-predict | 126.2ms | 70.07ms | 70.07 | 404.74ms | 93.81ms | 93.81 |
| stats-recommendations | 257.09ms | 71.07ms | 71.07 | 709ms | 100.9ms | 100.9 |
| stats-summary | 100.64ms | 76.47ms | 76.47 | 172.79ms | 101.21ms | 101.21 |
| stats-timeseries | 148.64ms | 70.42ms | 70.42 | 600.45ms | 96.33ms | 96.33 |
| stats-xp-history | 165.07ms | 74.85ms | 74.85 | 578.59ms | 105.41ms | 105.41 |
| students-leaderboard | 123.52ms | 108.85ms | 108.85 | 388.2ms | 337.45ms | 337.45 |
| students-profile | 105.62ms | 84.11ms | 84.11 | 222.54ms | 146.43ms | 146.43 |
| study-plan-by-id | 310.58ms | 105.01ms | 105.01 | 909.27ms | 192.33ms | 192.33 |
| study-plan-quiz | 184.45ms | 74.66ms | 74.66 | 701.64ms | 105.84ms | 105.84 |
| study-plans-active-context | 158.51ms | 78.37ms | 78.37 | 498.16ms | 119.04ms | 119.04 |
| study-plans-list | 306.72ms | 70.58ms | 70.58 | 976.32ms | 99.26ms | 99.26 |
| study-plans-stats | 107.37ms | 71.8ms | 71.8 | 248.13ms | 102.45ms | 102.45 |
