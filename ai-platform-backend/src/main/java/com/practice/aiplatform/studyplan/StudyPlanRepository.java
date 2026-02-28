package com.practice.aiplatform.studyplan;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    @EntityGraph(attributePaths = { "items" })
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
    List<StudyPlanSummaryDto> findSummariesByStudentId(@Param("studentId") Long studentId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudyPlan p WHERE p.student.id = :studentId")
    void deleteByStudentId(@Param("studentId") Long studentId);

    long countByStudentIdAndCreatedAtAfter(Long studentId, LocalDateTime startOfDay);
}
