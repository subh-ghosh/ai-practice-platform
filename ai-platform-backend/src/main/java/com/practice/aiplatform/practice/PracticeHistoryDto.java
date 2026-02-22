package com.practice.aiplatform.practice;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.LocalDateTime;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public record PracticeHistoryDto(
        Long studentId,
        String studentFirstName,
        List<QuestionAnswerDto> history
) {

    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
    public record QuestionAnswerDto(
            Long questionId,
            String questionText,

            // --- ADD THESE 3 LINES ---
            String subject,
            String topic,
            String difficulty,
            // -------------------------

            LocalDateTime generatedAt,
            String answerText,
            Boolean isCorrect,
            String evaluationStatus,
            String hint,
            String feedback,
            LocalDateTime submittedAt
    ) {
    }
}
