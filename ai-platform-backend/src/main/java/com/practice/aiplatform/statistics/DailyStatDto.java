package com.practice.aiplatform.statistics;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.LocalDate;

/**
 * A DTO to hold statistics for a single day.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public record DailyStatDto(
        LocalDate date,
        double accuracy,
        double averageSpeedSeconds,
        int attempts
) {
}
