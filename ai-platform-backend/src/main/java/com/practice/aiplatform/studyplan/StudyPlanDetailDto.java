package com.practice.aiplatform.studyplan;

import java.time.LocalDateTime;
import java.util.List;

public record StudyPlanDetailDto(
                Long id,
                String title,
                String topic,
                String difficulty,
                int durationDays,
                String description,
                int progress,
                StudyPlanDetailStudentDto student,
                List<StudyPlanItemDto> items,
                LocalDateTime createdAt,
                boolean completed,
                boolean isGenerating) {
}
