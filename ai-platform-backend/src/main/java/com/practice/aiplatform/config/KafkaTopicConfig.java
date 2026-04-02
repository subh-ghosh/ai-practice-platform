package com.practice.aiplatform.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    // Dynamically set replicas: 3 for Confluent Cloud (HA), 1 for local/other brokers
    private static final short REPLICAS = System.getenv("SPRING_KAFKA_BOOTSTRAP_SERVERS") != null
            && System.getenv("SPRING_KAFKA_BOOTSTRAP_SERVERS").contains("confluent")
            ? (short) 3 : (short) 1;

    @Bean
    public NewTopic gamificationTopic() {
        return TopicBuilder.name("gamification.events")
                .partitions(1)
                .replicas(REPLICAS)
                .build();
    }

    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name("notification.events")
                .partitions(1)
                .replicas(REPLICAS)
                .build();
    }

    @Bean
    public NewTopic recoveryPlanTopic() {
        return TopicBuilder.name("recoveryplan.events")
                .partitions(1)
                .replicas(REPLICAS)
                .build();
    }
}
