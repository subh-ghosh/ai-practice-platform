package com.practice.aiplatform.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- ADD THIS IMPORT
import org.springframework.data.repository.query.Param; // <-- ADD THIS IMPORT
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    // --- ADD THIS NEW METHOD ---
    /**
     * Finds a student by email and also fetches all their questions
     * and the corresponding answers in a single query (solves N+1 problem).
     */
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.questions q LEFT JOIN FETCH q.answer WHERE s.email = :email")
    Optional<Student> findByEmailWithHistory(@Param("email") String email);
    // --- END OF NEW METHOD ---
}