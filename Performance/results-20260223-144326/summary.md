# K6 Results Summary

Results folder: results-20260223-144326

| Endpoint | Avg | P95 | P90 | Med | Max | Failed | Checks Succeeded | Reqs |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 119.04ms | 358.44ms | 208.66ms | 72.65ms | 1.63s | 0.00% | 100.00% 3182 out of 3182 | 3182   15.090315/s |
| courses-list | 333.82ms | 906.33ms | 791.45ms | 207.37ms | 2.19s | 0.00% | 100.00% 2673 out of 2673 | 2673   12.708979/s |
| gamification-badges | 318.54ms | 911.57ms | 707.44ms | 200.2ms | 2.29s | 0.00% | 100.00% 2701 out of 2701 | 2701   12.798376/s |
| gamification-daily-challenges | 229.3ms | 784.19ms | 598.29ms | 99.98ms | 1.99s | 0.00% | 100.00% 2895 out of 2895 | 2895   13.781402/s |
| notifications-all | 174.27ms | 597.24ms | 402.33ms | 84.22ms | 1.83s | 0.00% | 100.00% 3034 out of 3034 | 3034   14.375739/s |
| notifications-unread | 96.22ms | 222.86ms | 124.95ms | 72.67ms | 1.01s | 0.00% | 100.00% 3246 out of 3246 | 3246   15.441906/s |
| practice-history | 145.42ms | 592.74ms | 308.03ms | 77.89ms | 1.7s | 0.00% | 100.00% 3110 out of 3110 | 3110   14.739061/s |
| practice-suggestion | 91.4ms | 199.33ms | 103.39ms | 69.16ms | 1.5s | 0.00% | 100.00% 3260 out of 3260 | 3260   15.514843/s |
| recommendations-ai-coach | 205.87ms | 608.3ms | 480.71ms | 109ms | 1.68s | 0.00% | 100.00% 2949 out of 2949 | 2949   13.976626/s |
| recommendations-dashboard | 74.27ms | 99.9ms | 89.63ms | 68.91ms | 585.1ms | 0.00% | 100.00% 3310 out of 3310 | 3310   15.683138/s |
| recommendations-predict | 112.28ms | 365.4ms | 205.66ms | 73.86ms | 1.28s | 0.00% | 100.00% 3203 out of 3203 | 3203   15.207274/s |
| stats-recommendations | 79.22ms | 110.56ms | 95.44ms | 68.41ms | 703.31ms | 0.00% | 100.00% 3295 out of 3295 | 3295   15.680011/s |
| stats-summary | 150.19ms | 477.13ms | 382.08ms | 87.09ms | 1.23s | 0.00% | 100.00% 3089 out of 3089 | 3089   14.676957/s |
| stats-timeseries | 84.4ms | 137.31ms | 97.73ms | 68.76ms | 968.89ms | 0.00% | 100.00% 3277 out of 3277 | 3277   15.597738/s |
| stats-xp-history | 102.62ms | 276.01ms | 133.39ms | 75.1ms | 1.09s | 0.00% | 100.00% 3225 out of 3225 | 3225   15.299775/s |
| students-leaderboard | 73.06ms | 98.65ms | 86.14ms | 66.13ms | 533.02ms | 0.00% | 100.00% 3315 out of 3315 | 3315   15.721561/s |
| students-profile | 79.63ms | 129.04ms | 96.29ms | 67.14ms | 641.24ms | 0.00% | 100.00% 3296 out of 3296 | 3296   15.63968/s |
| study-plans-active-context | 80.49ms | 105.55ms | 89.36ms | 67.47ms | 1.59s | 0.00% | 100.00% 3292 out of 3292 | 3292   15.617163/s |
| study-plans-list | 78.69ms | 115.45ms | 96.85ms | 68.33ms | 794.42ms | 0.00% | 100.00% 3300 out of 3300 | 3300   15.690936/s |
| study-plans-stats | 79.08ms | 112.9ms | 95.4ms | 69.47ms | 900.41ms | 0.00% | 100.00% 3296 out of 3296 | 3296   15.673283/s |


## Before vs After (Avg/P95)

Before: results-20260222-165555

After: results-20260223-144326

| Endpoint | Avg (Before) | Avg (After) | Avg ? ms | P95 (Before) | P95 (After) | P95 ? ms |
|---|---:|---:|---:|---:|---:|---:|
| courses-auth-check | 195.71ms | 119.04ms | -76.67 | 594.14ms | 358.44ms | -235.7 |
| courses-list | 434.76ms | 333.82ms | -100.94 | 1.14s | 906.33ms | -233.67 |
| gamification-badges | 129.8ms | 318.54ms | 188.74 | 416.5ms | 911.57ms | 495.07 |
| gamification-daily-challenges | 135.86ms | 229.3ms | 93.44 | 421.08ms | 784.19ms | 363.11 |
| notifications-all | 87.79ms | 174.27ms | 86.48 | 150.54ms | 597.24ms | 446.7 |
| notifications-unread | 132.47ms | 96.22ms | -36.25 | 386.77ms | 222.86ms | -163.91 |
| practice-history | 217.12ms | 145.42ms | -71.7 | 885.79ms | 592.74ms | -293.05 |
| practice-suggestion | 188.89ms | 91.4ms | -97.49 | 802.77ms | 199.33ms | -603.44 |
| recommendations-ai-coach | 433.8ms | 205.87ms | -227.93 | 1.3s | 608.3ms | -691.7 |
| recommendations-dashboard | 274.52ms | 74.27ms | -200.25 | 1.02s | 99.9ms | -920.1 |
| recommendations-predict | 126.2ms | 112.28ms | -13.92 | 404.74ms | 365.4ms | -39.34 |
| stats-recommendations | 257.09ms | 79.22ms | -177.87 | 709ms | 110.56ms | -598.44 |
| stats-summary | 100.64ms | 150.19ms | 49.55 | 172.79ms | 477.13ms | 304.34 |
| stats-timeseries | 148.64ms | 84.4ms | -64.24 | 600.45ms | 137.31ms | -463.14 |
| stats-xp-history | 165.07ms | 102.62ms | -62.45 | 578.59ms | 276.01ms | -302.58 |
| students-leaderboard | 123.52ms | 73.06ms | -50.46 | 388.2ms | 98.65ms | -289.55 |
| students-profile | 105.62ms | 79.63ms | -25.99 | 222.54ms | 129.04ms | -93.5 |
| study-plans-active-context | 158.51ms | 80.49ms | -78.02 | 498.16ms | 105.55ms | -392.61 |
| study-plans-list | 306.72ms | 78.69ms | -228.03 | 976.32ms | 115.45ms | -860.87 |
| study-plans-stats | 107.37ms | 79.08ms | -28.29 | 248.13ms | 112.9ms | -135.23 |
