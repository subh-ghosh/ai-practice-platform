package com.practice.aiplatform.studyplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @EntityGraph(attributePaths = { "items", "items.quizQuestions" })
    @Query("select p from StudyPlan p where p.id = :id")
    StudyPlan findWithItemsById(@Param("id") Long id);

    @Query("""
            select new com.practice.aiplatform.studyplan.StudyPlanSummaryDto(
                p.id, p.title, p.topic, p.difficulty, p.durationDays, p.description, p.progress, p.isCompleted, p.createdAt
            )
            from StudyPlan p
            where p.student.id = :studentId
            order by p.createdAt desc
            """)
    List<StudyPlanSummaryDto> findSummariesByStudentId(@Param("studentId") Long studentId);

    long countByStudentIdAndCreatedAtAfter(Long studentId, LocalDateTime startOfDay);
}
