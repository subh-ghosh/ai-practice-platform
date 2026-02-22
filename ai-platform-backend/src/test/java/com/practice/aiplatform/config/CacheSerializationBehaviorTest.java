package com.practice.aiplatform.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.practice.aiplatform.recommendation.RecommendationService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.util.Map;

class CacheSerializationBehaviorTest {

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
        RecommendationService.Prediction original =
                new RecommendationService.Prediction("Topic", "Beginner", 0.5, "LOW_DATA");

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
}
