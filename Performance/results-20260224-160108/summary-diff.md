# K6 Results Diff (Before vs After)

Before: results-20260222-165555

After: results-20260224-160108

| Endpoint | Avg (Before) | Avg (After) | Avg ? ms | P95 (Before) | P95 (After) | P95 ? ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 195.71ms | 65.64ms | -130.07 | 594.14ms | 80.26ms | -513.88 |
| courses-list | 434.76ms | 66.53ms | -368.23 | 1.14s | 80.92ms | -1059.08 |
| gamification-badges | 129.8ms | 74.41ms | -55.39 | 416.5ms | 97.92ms | -318.58 |
| gamification-daily-challenges | 135.86ms | 71.26ms | -64.6 | 421.08ms | 95.36ms | -325.72 |
| notifications-all | 87.79ms | 71.92ms | -15.87 | 150.54ms | 95.38ms | -55.16 |
| notifications-unread | 132.47ms | 71.4ms | -61.07 | 386.77ms | 96.09ms | -290.68 |
| practice-history | 217.12ms | 87.49ms | -129.63 | 885.79ms | 124.98ms | -760.81 |
| practice-suggestion | 188.89ms | 70.9ms | -117.99 | 802.77ms | 94.06ms | -708.71 |
| recommendations-ai-coach | 433.8ms | 74.35ms | -359.45 | 1.3s | 102.53ms | -1197.47 |
| recommendations-dashboard | 274.52ms | 69.98ms | -204.54 | 1.02s | 93.23ms | -926.77 |
| recommendations-predict | 126.2ms | 70.07ms | -56.13 | 404.74ms | 93.81ms | -310.93 |
| stats-recommendations | 257.09ms | 71.07ms | -186.02 | 709ms | 100.9ms | -608.1 |
| stats-summary | 100.64ms | 76.47ms | -24.17 | 172.79ms | 101.21ms | -71.58 |
| stats-timeseries | 148.64ms | 70.42ms | -78.22 | 600.45ms | 96.33ms | -504.12 |
| stats-xp-history | 165.07ms | 74.85ms | -90.22 | 578.59ms | 105.41ms | -473.18 |
| students-leaderboard | 123.52ms | 108.85ms | -14.67 | 388.2ms | 337.45ms | -50.75 |
| students-profile | 105.62ms | 84.11ms | -21.51 | 222.54ms | 146.43ms | -76.11 |
| study-plan-by-id | 310.58ms | 105.01ms | -205.57 | 909.27ms | 192.33ms | -716.94 |
| study-plan-quiz | 184.45ms | 74.66ms | -109.79 | 701.64ms | 105.84ms | -595.8 |
| study-plans-active-context | 158.51ms | 78.37ms | -80.14 | 498.16ms | 119.04ms | -379.12 |
| study-plans-list | 306.72ms | 70.58ms | -236.14 | 976.32ms | 99.26ms | -877.06 |
| study-plans-stats | 107.37ms | 71.8ms | -35.57 | 248.13ms | 102.45ms | -145.68 |
