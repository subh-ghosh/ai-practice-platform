package com.practice.aiplatform.statistics;

import java.time.LocalDate;

/**
 * A DTO to hold statistics for a single day.
 */
public record DailyStatDto(
        LocalDate date,
        double accuracy,
        double averageSpeedSeconds,
        int attempts
) {
}