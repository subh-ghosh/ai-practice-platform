package com.practice.aiplatform.statistics;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.practice.aiplatform.practice.PracticeHistoryDto;
import java.util.List;

/**
 * A DTO to hold the calculated statistics for the user's dashboard.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public record StatisticsDto(
        long totalAttempts,
        long correctCount,
        long incorrectCount,
        long revealedCount,
        double accuracyPercentage,
        double averageAnswerTimeSeconds, // <-- ADD THIS
        List<PracticeHistoryDto.QuestionAnswerDto> recentActivity
) {
}
