package com.practice.aiplatform.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC_NAME = "notification.events";

    public void publishNotificationEvent(NotificationEvent event) {
        log.info("📢 Broadcasting Notification Event to Kafka for student ID: {}", event.getStudentId());
        kafkaTemplate.send(TOPIC_NAME, String.valueOf(event.getStudentId()), event);
    }
}
