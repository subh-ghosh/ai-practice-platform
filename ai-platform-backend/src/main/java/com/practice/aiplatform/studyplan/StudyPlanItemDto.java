package com.practice.aiplatform.studyplan;

import java.util.List;

public record StudyPlanItemDto(
        Long id,
        String itemType,
        String title,
        String description,
        String videoId,
        String videoUrl,
        String thumbnailUrl,
        String channelName,
        String videoDuration,
        String practiceSubject,
        String practiceTopic,
        String practiceDifficulty,
        int dayNumber,
        int orderIndex,
        int xpReward,
        List<StudyPlanQuizQuestionDto> quizQuestions,
        boolean completed
) {
}
