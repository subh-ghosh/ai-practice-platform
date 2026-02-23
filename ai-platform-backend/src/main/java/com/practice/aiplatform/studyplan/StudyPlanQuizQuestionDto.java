package com.practice.aiplatform.studyplan;

public record StudyPlanQuizQuestionDto(
        Long id,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD
) {
}
