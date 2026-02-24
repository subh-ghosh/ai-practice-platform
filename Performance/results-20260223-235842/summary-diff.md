# K6 Results Diff (Before vs After)

Before: results-20260222-165555

After: results-20260223-235842

| Endpoint | Avg (Before) | Avg (After) | Avg ? ms | P95 (Before) | P95 (After) | P95 ? ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 195.71ms | 121.13ms | -74.58 | 594.14ms | 201.23ms | -392.91 |
| courses-list | 434.76ms | 146.47ms | -288.29 | 1.14s | 281ms | -859 |
| gamification-badges | 129.8ms | 155.26ms | 25.46 | 416.5ms | 287.91ms | -128.59 |
| gamification-daily-challenges | 135.86ms | 150.25ms | 14.39 | 421.08ms | 295ms | -126.08 |
| notifications-all | 87.79ms | 181.62ms | 93.83 | 150.54ms | 374.95ms | 224.41 |
| notifications-unread | 132.47ms | 166.06ms | 33.59 | 386.77ms | 315.91ms | -70.86 |
| practice-history | 217.12ms | 207.75ms | -9.37 | 885.79ms | 651.58ms | -234.21 |
| practice-suggestion | 188.89ms | 176.56ms | -12.33 | 802.77ms | 411.98ms | -390.79 |
| recommendations-ai-coach | 433.8ms | 140.56ms | -293.24 | 1.3s | 264.57ms | -1035.43 |
| recommendations-dashboard | 274.52ms | 147.34ms | -127.18 | 1.02s | 301.46ms | -718.54 |
| recommendations-predict | 126.2ms | 136.52ms | 10.32 | 404.74ms | 233.92ms | -170.82 |
| stats-recommendations | 257.09ms | 124.94ms | -132.15 | 709ms | 200.42ms | -508.58 |
| stats-summary | 100.64ms | 120.38ms | 19.74 | 172.79ms | 197.34ms | 24.55 |
| stats-timeseries | 148.64ms | 126.86ms | -21.78 | 600.45ms | 199.41ms | -401.04 |
| stats-xp-history | 165.07ms | 131.19ms | -33.88 | 578.59ms | 241.95ms | -336.64 |
| students-leaderboard | 123.52ms | 109.7ms | -13.82 | 388.2ms | 191.35ms | -196.85 |
| students-profile | 105.62ms | 148.87ms | 43.25 | 222.54ms | 394.84ms | 172.3 |
| study-plan-by-id | 310.58ms | 109.9ms | -200.68 | 909.27ms | 156.85ms | -752.42 |
| study-plan-quiz | 184.45ms | 103.02ms | -81.43 | 701.64ms | 133.39ms | -568.25 |
| study-plans-active-context | 158.51ms | 120.15ms | -38.36 | 498.16ms | 201.37ms | -296.79 |
| study-plans-list | 306.72ms | 119.99ms | -186.73 | 976.32ms | 201.77ms | -774.55 |
| study-plans-stats | 107.37ms | 124.14ms | 16.77 | 248.13ms | 202.22ms | -45.91 |
