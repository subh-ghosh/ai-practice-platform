package com.practice.aiplatform.studyplan;

import com.practice.aiplatform.event.RecoveryPlanEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryPlanEventListener {

    private final StudyPlanService studyPlanService;

    @KafkaListener(topics = "recoveryplan.events", groupId = "practiceflow-studyplan-group")
    public void consumeRecoveryPlanEvent(RecoveryPlanEvent event) {
        log.info("🎧 Received Kafka Event: Starting heavy background AI generations for a 1-day Recovery Plan for {}",
                event.getUserEmail());
        try {
            // This normally takes 5-10 seconds of LLM + YouTube API time!
            studyPlanService.generateStudyPlan(
                    event.getUserEmail(),
                    event.getTopic() + " Recovery",
                    event.getDifficulty(),
                    event.getDays());
            log.info("✅ Asynchronously finished AI Study Plan for {} via Kafka.", event.getUserEmail());
        } catch (Exception e) {
            log.error("❌ Failed to process Kafka recovery plan event for {}: {}", event.getUserEmail(), e.getMessage());
        }
    }
}
