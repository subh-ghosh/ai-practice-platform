# Performance Improvement Summary

Date: 2026-02-24

This document summarizes how performance improved, why each endpoint uses a specific cache layer, and the decisions behind those choices.

## What Changed

1. Added multi-tier caching:
   - **L1 (Caffeine in-process)** for very hot, bursty endpoints to reduce Redis hops and free-tier quotas.
   - **L2 (Redis)** for shared, cross-instance caches and heavier computations.
2. Switched study plan list responses to **summary DTOs by default** to avoid caching JPA entities and reduce payload size.
3. Added cache eviction discipline on write paths to avoid stale data.
4. Built a repeatable k6 harness with warmup and full tests for before/after comparisons.

## Why We Chose L1 vs L2 Per Endpoint

Rule of thumb:
- **L1 (Caffeine)** for fast-changing, bursty endpoints with high read frequency.
- **L2 (Redis)** for heavier responses and cross-instance consistency.
- **No Redis for entity lists** to avoid lazy-loading serialization issues and large payloads.

### L1 (Caffeine) + L2 (Redis) Endpoints
These are hot endpoints where a local 15–30s cache absorbs most repeated hits, then Redis backs it.

- `GET /api/notifications`
  - **L1**: Caffeine 30s
  - **L2**: Redis `UserNotificationsAllCache`
  - Rationale: high polling frequency, avoid free-tier Redis exhaustion.

- `GET /api/notifications/unread`
  - **L1**: Caffeine 30s
  - **L2**: Redis `UserNotificationsUnreadCache`
  - Rationale: same as above; reduce repeat hits.

- `GET /api/students/profile`
  - **L1**: Caffeine 15s
  - **L2**: Redis `UserProfileCache`
  - Rationale: very frequent, small payload; Redis hop can be slower than DB.

- `GET /api/stats/summary`
  - **L1**: Caffeine 15s
  - **L2**: Redis `UserStatisticsSummaryCache`
  - Rationale: was regressing under Redis-only; L1 removes Redis hop.

- `GET /api/gamification/badges`
  - **L1**: Caffeine 30s
  - **L2**: Redis `UserBadgesCache`
  - Rationale: frequent reads, small payload; L1 smooths spikes.

- `GET /api/gamification/daily-challenges`
  - **L1**: Caffeine 30s
  - **L2**: Redis `UserDailyChallengesCache`
  - Rationale: free-tier stability and smoother latency.

### Redis-Only (L2) Endpoints
These are heavier or benefit from cross-instance sharing.

- `GET /api/courses` → `UserCoursesCache`
- `GET /api/practice/history` → `UserPracticeHistoryCache`
- `GET /api/practice/suggestion` → `UserSuggestedPracticeCache`
- `GET /api/recommendations/dashboard` → `UserRecommendationsCache`
- `GET /api/recommendations/predict` → `PredictSuccessCache`
- `GET /api/recommendations/ai-coach` → `UserAiCoachInsightCache`
- `GET /api/stats/timeseries` → `UserStatisticsTimeseriesCache`
- `GET /api/stats/recommendations` → `UserStatisticsRecommendationsCache`
- `GET /api/stats/xp-history` → `UserXpHistoryCache`
- `GET /api/study-plans?summary=true` → `UserStudyPlanSummariesCache`
- `GET /api/study-plans/{id}` → `StudyPlanByIdCache`
- `GET /api/study-plans/{planId}/items/{itemId}/quiz` → `StudyPlanQuizQuestionsCache`
- `GET /api/study-plans/stats` → `UserStudyPlanStatsCache`
- `GET /api/study-plans/active-context` → `UserActiveContextCache`
- `POST /api/ai/*` → `AiQuestionCache`, `AiHintCache`, `AiAnswerCache`
- AI evaluation → `AiEvaluateCache`
- YouTube lookups → `YtSearchVideosCache`, `YtSearchPlaylistsCache`, `YtPlaylistItemsCache`

Rationale:
- These endpoints are heavier (joins, aggregation, AI calls) and benefit from shared caching.
- Data is stable enough for TTL-based caching to give clear wins.

### No Redis for Entity Lists

- `/api/study-plans` now returns **summary DTOs by default**.
- Full list only on `?full=true`.

Reason:
- JPA entity lists can break when serialized (lazy-loading), and can be huge.
- DTOs are small, safe, and cacheable.

## Performance Outcomes (Key Deltas)

From `results-20260222-165555` to `results-20260224-160108`:

- `study-plans-list` avg **306.72ms → 70.58ms**, P95 **976ms → 99ms**
- `study-plan-by-id` avg **310.58ms → 105.01ms**, P95 **909ms → 192ms**
- `recommendations-ai-coach` avg **433.8ms → 74.35ms**
- `practice-history` avg **217.12ms → 87.49ms**
- `stats-summary` avg **100.64ms → 76.47ms**

## Why This Is Production-Safe

- Avoids caching JPA entities directly.
- Short TTLs for volatile user-specific data.
- L1 cache protects free-tier Redis quota.
- Redis still used where cross-instance sharing matters.

