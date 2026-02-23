package com.practice.aiplatform.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.CacheKeyPrefix;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
public class CacheConfig {

    private static final String CACHE_SCHEMA_PREFIX = "v2::";

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        RedisCacheConfiguration defaultConfig = buildConfig(Duration.ofMinutes(3));

        return (builder) -> builder
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration("YtSearchVideosCache", buildConfig(Duration.ofHours(12)))
                .withCacheConfiguration("YtSearchPlaylistsCache", buildConfig(Duration.ofHours(12)))
                .withCacheConfiguration("YtPlaylistItemsCache", buildConfig(Duration.ofHours(12)))
                .withCacheConfiguration("UserStudyPlansCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("StudyPlanByIdCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("UserStudyPlanStatsCache", buildConfig(Duration.ofMinutes(3)))
                .withCacheConfiguration("StudyPlanQuizQuestionsCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("UserSuggestedPracticeCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserActiveContextCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserRecommendationsCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("PredictSuccessCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("UserAiCoachPromptCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserAiCoachInsightCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserStatisticsSummaryCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserStatisticsTimeseriesCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserStatisticsRecommendationsCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserPracticeHistoryCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserNotificationsAllCache", buildConfig(Duration.ofMinutes(1)))
                .withCacheConfiguration("UserNotificationsUnreadCache", buildConfig(Duration.ofMinutes(1)))
                .withCacheConfiguration("UserBadgesCache", buildConfig(Duration.ofMinutes(10)))
                .withCacheConfiguration("UserDailyChallengesCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("UserXpHistoryCache", buildConfig(Duration.ofMinutes(2)))
                .withCacheConfiguration("AiQuestionCache", buildConfig(Duration.ofMinutes(10)))
                .withCacheConfiguration("AiHintCache", buildConfig(Duration.ofMinutes(10)))
                .withCacheConfiguration("AiAnswerCache", buildConfig(Duration.ofMinutes(10)))
                .withCacheConfiguration("AiEvaluateCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("UserCoursesCache", buildConfig(Duration.ofMinutes(10)))
                .withCacheConfiguration("UserProfileCache", buildConfig(Duration.ofMinutes(5)))
                .withCacheConfiguration("LeaderboardCache", buildConfig(Duration.ofMinutes(1)))
                .withCacheConfiguration("UserUsageRemainingCache", buildConfig(Duration.ofSeconds(30)));
    }

    private RedisCacheConfiguration buildConfig(Duration ttl) {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.registerModule(new Hibernate6Module());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .computePrefixWith(CacheKeyPrefix.prefixed(CACHE_SCHEMA_PREFIX))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(valueSerializer));
    }
}
