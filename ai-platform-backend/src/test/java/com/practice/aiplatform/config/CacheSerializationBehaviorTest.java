package com.practice.aiplatform.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.practice.aiplatform.practice.PracticeHistoryDto;
import com.practice.aiplatform.recommendation.RecommendationService;
import com.practice.aiplatform.statistics.DailyStatDto;
import com.practice.aiplatform.statistics.StatisticsDto;
import com.practice.aiplatform.statistics.StatisticsService;
import com.practice.aiplatform.studyplan.StudyPlanService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

class CacheSerializationBehaviorTest {

    private record NonAnnotatedRecord(String topic, String difficulty) {
    }

    @Test
    void nonFinalTypingDoesNotRoundTripRecordType() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.registerModule(new Hibernate6Module());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);
        NonAnnotatedRecord original = new NonAnnotatedRecord("Topic", "Beginner");

        byte[] bytes = serializer.serialize(original);
        Assertions.assertThrows(RuntimeException.class, () -> serializer.deserialize(bytes),
                "NON_FINAL typing can fail on final record cache values");
    }

    @Test
    void everythingTypingRoundTripsRecordAndMap() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.registerModule(new Hibernate6Module());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        RecommendationService.Prediction original =
                new RecommendationService.Prediction("Topic", "Beginner", 0.5, "LOW_DATA");
        byte[] predictionBytes = serializer.serialize(original);
        Object predictionRestored = serializer.deserialize(predictionBytes);
        Assertions.assertInstanceOf(RecommendationService.Prediction.class, predictionRestored);

        Map<String, String> insight = Map.of("insight", "Keep going", "suggestedAction", "PRACTICE");
        byte[] mapBytes = serializer.serialize(insight);
        Object mapRestored = serializer.deserialize(mapBytes);
        Assertions.assertInstanceOf(Map.class, mapRestored);
    }

    @Test
    void everythingTypingRoundTripsStatisticsAndHistoryRecords() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.registerModule(new Hibernate6Module());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(mapper);

        PracticeHistoryDto.QuestionAnswerDto qa = new PracticeHistoryDto.QuestionAnswerDto(
                1L,
                "What is polymorphism?",
                "Java",
                "OOP",
                "Beginner",
                LocalDateTime.now().minusMinutes(5),
                "Sample answer",
                true,
                "CORRECT",
                null,
                "Good",
                LocalDateTime.now()
        );

        PracticeHistoryDto historyDto = new PracticeHistoryDto(10L, "Subh", List.of(qa));
        byte[] historyBytes = serializer.serialize(historyDto);
        Object historyRestored = serializer.deserialize(historyBytes);
        Assertions.assertInstanceOf(PracticeHistoryDto.class, historyRestored);

        StatisticsDto statisticsDto = new StatisticsDto(
                1L, 1L, 0L, 0L, 100.0, 12.0, List.of(qa));
        byte[] statsBytes = serializer.serialize(statisticsDto);
        Object statsRestored = serializer.deserialize(statsBytes);
        Assertions.assertInstanceOf(StatisticsDto.class, statsRestored);

        DailyStatDto dailyStatDto = new DailyStatDto(LocalDate.now(), 100.0, 12.0, 1);
        byte[] dailyBytes = serializer.serialize(List.of(dailyStatDto));
        Object dailyRestored = serializer.deserialize(dailyBytes);
        Assertions.assertInstanceOf(List.class, dailyRestored);

        StatisticsService.SmartRecommendationDto smart =
                new StatisticsService.SmartRecommendationDto(List.of("OOP"), List.of("Threads"));
        byte[] smartBytes = serializer.serialize(smart);
        Object smartRestored = serializer.deserialize(smartBytes);
        Assertions.assertInstanceOf(StatisticsService.SmartRecommendationDto.class, smartRestored);

        StudyPlanService.StudyPlanStats planStats = new StudyPlanService.StudyPlanStats(1, 0, 10, 2);
        byte[] planBytes = serializer.serialize(planStats);
        Object planRestored = serializer.deserialize(planBytes);
        Assertions.assertInstanceOf(StudyPlanService.StudyPlanStats.class, planRestored);
    }
}
