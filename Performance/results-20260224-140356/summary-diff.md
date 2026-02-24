# K6 Results Diff (Before vs After)

Before: results-20260223-235842

After: results-20260224-140356

| Endpoint | Avg (Before) | Avg (After) | Avg ? ms | P95 (Before) | P95 (After) | P95 ? ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 121.13ms | 165.96ms | 44.83 | 201.23ms | 717.13ms | 515.9 |
| courses-list | 146.47ms | 214.2ms | 67.73 | 281ms | 488.89ms | 207.89 |
| gamification-badges | 155.26ms | 166.17ms | 10.91 | 287.91ms | 392.62ms | 104.71 |
| gamification-daily-challenges | 150.25ms | 123.5ms | -26.75 | 295ms | 310.64ms | 15.64 |
| notifications-all | 181.62ms | 226.28ms | 44.66 | 374.95ms | 607.61ms | 232.66 |
| notifications-unread | 166.06ms | 147.22ms | -18.84 | 315.91ms | 509.63ms | 193.72 |
| practice-history | 207.75ms | 569.62ms | 361.87 | 651.58ms | 1.32s | 668.42 |
| practice-suggestion | 176.56ms | 728.22ms | 551.66 | 411.98ms | 3.22s | 2808.02 |
| recommendations-ai-coach | 140.56ms | 470.52ms | 329.96 | 264.57ms | 1.06s | 795.43 |
| recommendations-dashboard | 147.34ms | 143.93ms | -3.41 | 301.46ms | 331.42ms | 29.96 |
| recommendations-predict | 136.52ms | 129.7ms | -6.82 | 233.92ms | 329.28ms | 95.36 |
| stats-recommendations | 124.94ms | 217.24ms | 92.3 | 200.42ms | 594.58ms | 394.16 |
| stats-summary | 120.38ms | 643.66ms | 523.28 | 197.34ms | 2.23s | 2032.66 |
| stats-timeseries | 126.86ms | 277.9ms | 151.04 | 199.41ms | 701.02ms | 501.61 |
| stats-xp-history | 131.19ms | 369.46ms | 238.27 | 241.95ms | 894.43ms | 652.48 |
| students-leaderboard | 109.7ms | 198.45ms | 88.75 | 191.35ms | 574.87ms | 383.52 |
| students-profile | 148.87ms | 173.81ms | 24.94 | 394.84ms | 533.84ms | 139 |
| study-plan-by-id | 109.9ms | 568.84ms | 458.94 | 156.85ms | 1.67s | 1513.15 |
| study-plan-quiz | 103.02ms | 518.12ms | 415.1 | 133.39ms | 2.04s | 1906.61 |
| study-plans-active-context | 120.15ms | 402.43ms | 282.28 | 201.37ms | 1.7s | 1498.63 |
| study-plans-list | 119.99ms | 264.23ms | 144.24 | 201.77ms | 712.42ms | 510.65 |
| study-plans-stats | 124.14ms | 290.07ms | 165.93 | 202.22ms | 792.76ms | 590.54 |
