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
            LocalDateTime generatedAt,
            String answerText,
            Boolean isCorrect,
            String feedback,
            LocalDateTime submittedAt
    ) {
    }
}

