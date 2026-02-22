# Redis Cache Matrix

## Summary
Redis caching is implemented to reduce repeat DB/API/AI work on hot read paths, with targeted eviction on writes to keep data consistent.

### Why this was done
- Reduce DB hits on repeated dashboard, practice, statistics, and study-plan reads.
- Reduce external YouTube API calls and quota usage.
- Reduce repeated recommendation/AI-coach/statistics computation cost.
- Keep correctness with explicit eviction when data changes.

### How this was done
- Enabled Spring Cache + Redis.
- Centralized cache names and per-cache TTL in `CacheConfig`.
- Added `@Cacheable(sync = true)` to read-heavy methods.
- Added `@CacheEvict` / `@Caching` on write/mutation methods that impact cached reads.
- Added a fail-safe `CacheErrorHandler` so cache failures do not fail requests.
- Enabled debug logs for cache and Redis visibility.

### Core infra files
- `pom.xml`
- `src/main/java/com/practice/aiplatform/AiPlatformApplication.java`
- `src/main/java/com/practice/aiplatform/config/CacheConfig.java`
- `src/main/java/com/practice/aiplatform/config/CacheErrorConfig.java`
- `src/main/resources/application.properties`

## Cache Table
| Method | Cache Name | Key | TTL | Invalidated By |
|---|---|---|---|---|
| `YouTubeService.searchVideos` | `YtSearchVideosCache` | `#query + '-' + #maxResults` | `12h` | TTL only |
| `YouTubeService.searchPlaylists` | `YtSearchPlaylistsCache` | `#query + '-' + #maxResults` | `12h` | TTL only |
| `YouTubeService.getPlaylistItems` | `YtPlaylistItemsCache` | `#playlistId + '-' + #maxResults` | `12h` | TTL only |
| `StudyPlanService.getStudyPlans` | `UserStudyPlansCache` | `#userEmail` | `5m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getStudyPlan` | `StudyPlanByIdCache` | `#id` | `5m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getStats` | `UserStudyPlanStatsCache` | `#userEmail` | `3m` | same study-plan mutation methods above |
| `StudyPlanService.getQuizQuestions` | `StudyPlanQuizQuestionsCache` | `#planId + '-' + #itemId` | `5m` | `submitQuizAnswers` |
| `StudyPlanService.getSuggestedPracticeItem` | `UserSuggestedPracticeCache` | `#userEmail` | `2m` | `generateStudyPlan`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `StudyPlanService.getActiveContext` | `UserActiveContextCache` | `#userEmail` | `2m` | `generateStudyPlan`, `submitQuizAnswers`, `markItemComplete`, `deleteStudyPlan`, `markExternalPracticeAsComplete`, `generateStudyPlanFromSyllabus` |
| `RecommendationService.getRecommendations` | `UserRecommendationsCache` | `#userEmail` | `2m` | `PracticeController.submitAnswer/getAnswer`, study-plan mutations |
| `RecommendationService.predictSuccess` | `PredictSuccessCache` | `#userEmail + '-' + #topic + '-' + #difficulty` | `5m` | `PracticeController.submitAnswer/getAnswer` (`allEntries`) |
| `RecommendationService.buildAiCoachPromptData` | `UserAiCoachPromptCache` | `#userEmail` | `2m` | `PracticeController.submitAnswer/getAnswer` |
| `RecommendationController.getAiCoachInsight` | `UserAiCoachInsightCache` | `#principal.name` | `2m` | `PracticeController.submitAnswer/getAnswer` |
| `StatisticsService.getStatistics` | `UserStatisticsSummaryCache` | `#email` | `2m` | `PracticeController.submitAnswer/getAnswer` |
| `StatisticsService.getTimeSeriesStats` | `UserStatisticsTimeseriesCache` | `#email` | `2m` | `PracticeController.submitAnswer/getAnswer` |
| `StatisticsService.getSmartRecommendations` | `UserStatisticsRecommendationsCache` | `#email` | `2m` | `PracticeController.submitAnswer/getAnswer`, study-plan mutations |
| `PracticeController.getHistory` | `UserPracticeHistoryCache` | `#principal.name` | `2m` | `PracticeController.submitAnswer/getAnswer` |
| `NotificationService.getAllNotifications` | `UserNotificationAllCache` | `#studentId` | `1m` | `createNotification`, `markAsRead`, `markAllAsRead` |
| `NotificationService.getUnreadNotifications` | `UserNotificationUnreadCache` | `#studentId` | `1m` | `createNotification`, `markAsRead`, `markAllAsRead` |
| `BadgeService.getUserBadges` | `UserBadgesCache` | `#studentId` | `5m` | `BadgeService.unlockBadge` |
| `DailyChallengeService.getTodayChallenges` | `UserDailyChallengesCache` | `#studentId` | `1m` | `generateDailyChallenges`, `incrementProgress`, `claimReward` |
| `XpService.getXpHistory` | `UserXpHistoryCache` | `#studentId + '-' + #days` | `2m` | `XpService.awardXp` (`allEntries`) |
| `CourseController.getMyCourses` | `UserCoursesCache` | `#principal.name` | `10m` | `generateCourse`, `deleteCourse` |
| `StudentController.getProfile` | `UserProfileCache` | `#principal.name` | `5m` | `updateProfile`, `changePassword`, `deleteAccount`, `XpService.awardXp` (`allEntries`) |
| `StudentController.getLeaderboard` | `LeaderboardCache` | `'top10'` | `1m` | `updateProfile`, `deleteAccount`, study-plan completion methods, `XpService.awardXp` |
| `StudentDetailsService.loadUserByUsername` | `SecurityUserDetailsCache` | `#email` | `2m` | `StudentController.changePassword`, `StudentController.deleteAccount` |
| `UsageService.hasActionsRemaining` | `UserUsageRemainingCache` | `#userEmail` | `30s` | `UsageService.canPerformAction`, `StudentController.changePassword`, `StudentController.deleteAccount` |

