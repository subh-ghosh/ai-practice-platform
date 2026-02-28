package com.practice.aiplatform.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GamificationEventPublisher {

    // Spring Boot automatically configures this template using our application.properties!
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // This must match the Topic name we are about to create in Aiven
    private static final String TOPIC_NAME = "gamification.events";

    public void publishPracticeCompletedEvent(PracticeCompletedEvent event) {
        log.info("📢 Broadcasting Practice Completed Event to Kafka for user: {}", event.getUserEmail());
        
        // We send the event to the topic. Kafka handles the rest instantly.
        kafkaTemplate.send(TOPIC_NAME, event.getUserEmail(), event);
    }
}
