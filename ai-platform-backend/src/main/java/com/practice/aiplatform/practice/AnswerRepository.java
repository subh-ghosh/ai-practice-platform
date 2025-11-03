package com.practice.aiplatform.practice;

import com.practice.aiplatform.user.Student; // --- IMPORT THIS ---
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // --- IMPORT THIS ---

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // --- ADD THIS METHOD ---
    /**
     * Finds all answers submitted by a specific student,
     * ordered by the submission time in descending order (latest first).
     */
    List<Answer> findAllByStudentOrderBySubmittedAtDesc(Student student);
    // -----------------------
}