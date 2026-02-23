package com.practice.aiplatform.studyplan;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByStudyPlanItemId(Long studyPlanItemId);

    List<QuizQuestion> findByStudyPlanItemIdIn(List<Long> studyPlanItemIds);
}
