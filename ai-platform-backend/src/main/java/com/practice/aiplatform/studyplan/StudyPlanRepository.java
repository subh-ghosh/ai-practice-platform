package com.practice.aiplatform.studyplan;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {
    List<StudyPlan> findByStudentIdOrderByCreatedAtDesc(Long studentId);
}
