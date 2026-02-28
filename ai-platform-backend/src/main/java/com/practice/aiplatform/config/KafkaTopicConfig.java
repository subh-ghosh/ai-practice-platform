package com.practice.aiplatform.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic gamificationTopic() {
        return TopicBuilder.name("gamification.events")
                .partitions(1)
                .replicas(1) // Aiven free/small tiers usually support 1 or 3 depending on plan
                .build();
    }

    @Bean
    public NewTopic notificationTopic() {
        return TopicBuilder.name("notification.events")
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic recoveryPlanTopic() {
        return TopicBuilder.name("recoveryplan.events")
                .partitions(1)
                .replicas(1)
                .build();
    }
}
