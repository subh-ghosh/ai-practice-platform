package com.practice.aiplatform.studyplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudyPlanItemRepository extends JpaRepository<StudyPlanItem, Long> {

    @Query("SELECT i FROM StudyPlanItem i JOIN i.studyPlan p WHERE p.student.id = :studentId AND i.itemType = 'PRACTICE' AND i.isCompleted = false AND LOWER(i.practiceTopic) = LOWER(:topic)")
    List<StudyPlanItem> findMatchingIncompleteItems(@Param("studentId") Long studentId, @Param("topic") String topic);

    // Find the first incomplete practice item for the student's active plan
    @Query("SELECT i FROM StudyPlanItem i JOIN i.studyPlan p WHERE p.student.id = :studentId AND i.itemType = 'PRACTICE' AND i.isCompleted = false AND p.isCompleted = false ORDER BY p.createdAt DESC, i.dayNumber ASC, i.orderIndex ASC")
    List<StudyPlanItem> findNextPracticeItems(@Param("studentId") Long studentId);
}
