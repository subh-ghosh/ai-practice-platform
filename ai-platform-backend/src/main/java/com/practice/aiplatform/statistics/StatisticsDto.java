package com.practice.aiplatform.statistics;

import com.practice.aiplatform.practice.PracticeHistoryDto;
import java.util.List;

/**
 * A DTO to hold the calculated statistics for the user's dashboard.
 */
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