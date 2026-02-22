# Redis Cache Matrix

## Summary
Redis caching is used on hot read paths to reduce DB/API/AI work. Cache invalidation is intentionally targeted (mostly key-based) to avoid cross-user cache churn.

### Core cache rules now in code
- `@Cacheable` is only on DTO/list/map-returning methods (not `ResponseEntity` controller endpoints).
- Study-plan caches that reference a plan/item are now user-scoped in the key.
- High-churn `allEntries = true` usage was reduced where practical, replaced with key eviction.
- Manual `CacheManager` eviction is used where annotation-only eviction cannot target the correct key set.
- Cache keys are namespaced with schema prefix `v2::` to avoid reading incompatible legacy payloads.

## Core infra files
- `src/main/java/com/practice/aiplatform/AiPlatformApplication.java`
- `src/main/java/com/practice/aiplatform/config/CacheConfig.java`
- `src/main/java/com/practice/aiplatform/config/CacheErrorConfig.java`
- `src/main/resources/application.properties`

## Cache Table
| Cached Method | Cache Name | Key | TTL | Invalidated By |
|---|---|---|---|---|
| `YouTubeService.searchVideos` | `YtSearchVideosCache` | `#query + '-' + #maxResults` | `12h` | TTL only |
| `YouTubeService.searchPlaylists` | `YtSearchPlaylistsCache` | `#query + '-' + #maxResults` | `12h` | TTL only |
| `YouTubeService.getPlaylistItems` | `YtPlaylistItemsCache` | `#playlistId + '-' + #maxResults` | `12h` | TTL only |
| `StudyPlanService.getStudyPlans` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `StudyPlanService.getStudyPlan` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `StudyPlanService.getStats` | `UserStudyPlanStatsCache` | `#userEmail` | `3m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getQuizQuestions` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `StudyPlanService.getSuggestedPracticeItem` | `UserSuggestedPracticeCache` | `#userEmail` | `2m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getActiveContext` | `UserActiveContextCache` | `#userEmail` | `2m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `RecommendationService.getRecommendations` | `UserRecommendationsCache` | `#userEmail` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer`, study-plan mutation methods above |
| `RecommendationService.predictSuccess` | `PredictSuccessCache` | `#userEmail + '-' + #topic + '-' + #difficulty` | `5m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` (`allEntries`) |
| `RecommendationService.buildAiCoachPromptData` | `UserAiCoachPromptCache` | `#userEmail` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` |
| `RecommendationController.getAiCoachInsightCached` | `UserAiCoachInsightCache` | `#email` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` |
| `StatisticsService.getStatistics` | `UserStatisticsSummaryCache` | `#email` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` |
| `StatisticsService.getTimeSeriesStats` | `UserStatisticsTimeseriesCache` | `#email` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` |
| `StatisticsService.getSmartRecommendations` | `UserStatisticsRecommendationsCache` | `#email` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer`, study-plan mutation methods above |
| `PracticeController.getHistoryCached` | `UserPracticeHistoryCache` | `#email` | `2m` | `PracticeController.submitAnswer`, `PracticeController.getAnswer` |
| `NotificationService.getAllNotifications` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `NotificationService.getUnreadNotifications` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `BadgeService.getUserBadges` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `DailyChallengeService.getTodayChallenges` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `XpService.getXpHistory` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `CourseController.getMyCoursesCached` | `UserCoursesCache` | `#email` | `10m` | `CourseController.generateCourse`, `CourseController.deleteCourse` |
| `StudentController.getProfileCached` | `UserProfileCache` | `#email` | `5m` | `StudentController.updateProfile`, `StudentController.changePassword`, `StudentController.deleteAccount`, `XpService.awardXp` |
| `StudentController.getLeaderboardCached` | _not cached_ | _n/a_ | _n/a_ | _n/a_ |
| `UsageService.hasActionsRemaining` | `UserUsageRemainingCache` | `#userEmail` | `30s` | `UsageService.canPerformAction`, `StudentController.changePassword`, `StudentController.deleteAccount` |

## Manual targeted evictions
- `StudyPlanService.deleteStudyPlan`: evicts all quiz-question cache keys for that owned plan (`userEmail-planId-itemId`).
- `StudyPlanService.markExternalPracticeAsComplete`: evicts `StudyPlanByIdCache` only for touched owned plans.

## Validation notes
- Cache names in annotations match `CacheConfig` definitions.
- Redis cache serialization is configured with polymorphic typing for final DTOs/records (`DefaultTyping.EVERYTHING`) to prevent cache-hit deserialization failures.
- Cached DTO records used by hot endpoints are explicitly annotated with `@JsonTypeInfo` for serializer compatibility.
- Cached map/list payloads avoid immutable JDK collection implementations on hot paths.
- No `SecurityUserDetailsCache` is active in current code.
- Backend compiles with these cache changes.
