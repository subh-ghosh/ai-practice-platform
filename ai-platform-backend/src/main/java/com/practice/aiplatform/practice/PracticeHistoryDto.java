package com.practice.aiplatform.practice;

import java.time.LocalDateTime;
import java.util.List;

public record PracticeHistoryDto(
        Long studentId,
        String studentFirstName,
        List<QuestionAnswerDto> history
) {

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