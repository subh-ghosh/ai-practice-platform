package com.practice.aiplatform.studyplan;

import java.time.LocalDateTime;

public record StudyPlanSummaryDto(
        Long id,
        String title,
        String topic,
        String difficulty,
        int durationDays,
        String description,
        int progress,
        boolean completed,
        LocalDateTime createdAt
) {
}
