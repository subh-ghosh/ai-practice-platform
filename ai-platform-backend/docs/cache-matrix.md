# Redis Cache Matrix

## Summary
Redis caching is used on hot read paths to reduce DB/API/AI work. Cache invalidation is intentionally targeted (mostly key-based) to avoid cross-user cache churn.

### Core cache rules now in code
- `@Cacheable` is only on DTO/list/map-returning methods (not `ResponseEntity` controller endpoints).
- Study-plan caches that reference a plan/item are now user-scoped in the key.
- High-churn `allEntries = true` usage was reduced where practical, replaced with key eviction.
- Manual `CacheManager` eviction is used where annotation-only eviction cannot target the correct key set.

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
| `StudyPlanService.getStudyPlans` | `UserStudyPlansCache` | `#userEmail` | `5m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getStudyPlan` | `StudyPlanByIdCache` | `#userEmail + '-' + #id` | `5m` | `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete (manual targeted)` |
| `StudyPlanService.getStats` | `UserStudyPlanStatsCache` | `#userEmail` | `3m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getQuizQuestions` | `StudyPlanQuizQuestionsCache` | `#userEmail + '-' + #planId + '-' + #itemId` | `5m` | `submitQuizAnswers`, `deleteStudyPlan (manual targeted)` |
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
| `NotificationService.getAllNotifications` | `UserNotificationAllCache` | `#studentId` | `1m` | `createNotification`, `markAsRead (manual targeted)`, `markAllAsRead` |
| `NotificationService.getUnreadNotifications` | `UserNotificationUnreadCache` | `#studentId` | `1m` | `createNotification`, `markAsRead (manual targeted)`, `markAllAsRead` |
| `BadgeService.getUserBadges` | `UserBadgesCache` | `#studentId` | `5m` | `BadgeService.unlockBadge` |
| `DailyChallengeService.getTodayChallenges` | `UserDailyChallengesCache` | `#studentId` | `1m` | `generateDailyChallenges`, `incrementProgress`, `claimReward (manual targeted)` |
| `XpService.getXpHistory` | `UserXpHistoryCache` | `#studentId` | `2m` | `XpService.awardXp` |
| `CourseController.getMyCoursesCached` | `UserCoursesCache` | `#email` | `10m` | `CourseController.generateCourse`, `CourseController.deleteCourse` |
| `StudentController.getProfileCached` | `UserProfileCache` | `#email` | `5m` | `StudentController.updateProfile`, `StudentController.changePassword`, `StudentController.deleteAccount`, `XpService.awardXp` |
| `StudentController.getLeaderboardCached` | `LeaderboardCache` | `'top10'` | `1m` | `StudentController.updateProfile`, `StudentController.deleteAccount`, `StudyPlanService.submitQuizAnswers`, `StudyPlanService.markItemComplete`, `StudyPlanService.markExternalPracticeAsComplete`, `XpService.awardXp` |
| `UsageService.hasActionsRemaining` | `UserUsageRemainingCache` | `#userEmail` | `30s` | `UsageService.canPerformAction`, `StudentController.changePassword`, `StudentController.deleteAccount` |

## Manual targeted evictions
- `NotificationService.markAsRead`: evicts `UserNotificationAllCache` and `UserNotificationUnreadCache` for only that notification's `studentId`.
- `DailyChallengeService.claimReward`: evicts `UserDailyChallengesCache` only for that challenge owner's `studentId`.
- `StudyPlanService.deleteStudyPlan`: evicts all quiz-question cache keys for that owned plan (`userEmail-planId-itemId`).
- `StudyPlanService.markExternalPracticeAsComplete`: evicts `StudyPlanByIdCache` only for touched owned plans.

## Validation notes
- Cache names in annotations match `CacheConfig` definitions.
- Redis cache serialization is configured with polymorphic typing for final DTOs/records (`DefaultTyping.EVERYTHING`) to prevent cache-hit deserialization failures.
- No `SecurityUserDetailsCache` is active in current code.
- Backend compiles with these cache changes.
