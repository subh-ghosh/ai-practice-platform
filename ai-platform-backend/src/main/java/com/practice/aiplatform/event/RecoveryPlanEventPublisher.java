package com.practice.aiplatform.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryPlanEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_NAME = "recoveryplan.events";

    public void publishRecoveryPlanEvent(RecoveryPlanEvent event) {
        log.info("📢 Broadcasting AI Recovery Plan Event to Kafka for user: {}", event.getUserEmail());
        kafkaTemplate.send(TOPIC_NAME, event.getUserEmail(), event);
    }
}
