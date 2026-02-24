# K6 Results Summary

Results folder: results-20260223-235842

| Endpoint | Avg | P95 | P90 | Med | Max | Failed | Checks Succeeded | Reqs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 121.13ms | 201.23ms | 167.17ms | 112.4ms | 767.76ms | 0.00% | 100.00% 3172 out of 3172 | 3172   15.093165/s |
| courses-list | 146.47ms | 281ms | 225.49ms | 125.32ms | 877.17ms | 0.00% | 100.00% 3104 out of 3104 | 3104   14.743168/s |
| gamification-badges | 155.26ms | 287.91ms | 234.3ms | 130.4ms | 1.37s | 0.00% | 100.00% 3076 out of 3076 | 3076   14.646716/s |
| gamification-daily-challenges | 150.25ms | 295ms | 232.7ms | 126.16ms | 690.77ms | 0.00% | 100.00% 3090 out of 3090 | 3090   14.650644/s |
| notifications-all | 181.62ms | 374.95ms | 275.55ms | 142.48ms | 4.1s | 0.00% | 100.00% 3004 out of 3004 | 3004   14.240516/s |
| notifications-unread | 166.06ms | 315.91ms | 251.44ms | 142.95ms | 689.58ms | 0.00% | 100.00% 3048 out of 3048 | 3048   14.469255/s |
| practice-history | 207.75ms | 651.58ms | 407.92ms | 132.27ms | 2.02s | 0.00% | 100.00% 2942 out of 2942 | 2942   13.987571/s |
| practice-suggestion | 176.56ms | 411.98ms | 279.03ms | 119.79ms | 2.42s | 0.00% | 100.00% 3018 out of 3018 | 3018   14.353455/s |
| recommendations-ai-coach | 140.56ms | 264.57ms | 206.11ms | 119.34ms | 1.43s | 0.00% | 100.00% 3116 out of 3116 | 3116   14.837754/s |
| recommendations-dashboard | 147.34ms | 301.46ms | 215.38ms | 116.67ms | 4.08s | 0.00% | 100.00% 3094 out of 3094 | 3094   14.717313/s |
| recommendations-predict | 136.52ms | 233.92ms | 201.74ms | 122.12ms | 517.69ms | 0.00% | 100.00% 3128 out of 3128 | 3128   14.816332/s |
| stats-recommendations | 124.94ms | 200.42ms | 169.58ms | 114.04ms | 1.82s | 0.00% | 100.00% 3161 out of 3161 | 3161   14.995857/s |
| stats-summary | 120.38ms | 197.34ms | 164.3ms | 110.83ms | 451.08ms | 0.00% | 100.00% 3173 out of 3173 | 3173   15.099498/s |
| stats-timeseries | 126.86ms | 199.41ms | 172.31ms | 114.74ms | 718.49ms | 0.00% | 100.00% 3154 out of 3154 | 3154   14.995556/s |
| stats-xp-history | 131.19ms | 241.95ms | 191.79ms | 114.34ms | 755.56ms | 0.00% | 100.00% 3146 out of 3146 | 3146   14.914184/s |
| students-leaderboard | 109.7ms | 191.35ms | 137.36ms | 100.73ms | 712.89ms | 0.00% | 100.00% 3206 out of 3206 | 3206   15.242637/s |
| students-profile | 148.87ms | 394.84ms | 206.88ms | 112.48ms | 1.49s | 0.00% | 100.00% 3096 out of 3096 | 3096   14.708145/s |
| study-plan-by-id | 109.9ms | 156.85ms | 129.51ms | 100.58ms | 756.79ms | 0.00% | 100.00% 3205 out of 3205 | 3205   15.228683/s |
| study-plan-quiz | 103.02ms | 133.39ms | 123.92ms | 95.7ms | 693.43ms | 0.00% | 100.00% 3224 out of 3224 | 3224   15.305533/s |
| study-plans-active-context | 120.15ms | 201.37ms | 160.88ms | 112.86ms | 445.9ms | 0.00% | 100.00% 3174 out of 3174 | 3174   15.038352/s |
| study-plans-list | 119.99ms | 201.77ms | 168.5ms | 110.23ms | 679ms | 0.00% | 100.00% 3174 out of 3174 | 3174   15.05935/s |
| study-plans-stats | 124.14ms | 202.22ms | 162.87ms | 114.82ms | 2.45s | 0.00% | 100.00% 3164 out of 3164 | 3164   15.025934/s |


## Before vs After (Avg/P95)

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
