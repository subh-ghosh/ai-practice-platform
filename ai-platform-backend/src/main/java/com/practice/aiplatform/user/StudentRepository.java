package com.practice.aiplatform.user;

import org.springframework.data.jpa.repository.JpaRepository;
// --- REMOVE THESE IMPORTS ---
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// ----------------------------
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    // --- REMOVE THIS ENTIRE METHOD ---
    // @Query("SELECT s FROM Student s LEFT JOIN FETCH s.questions q LEFT JOIN FETCH q.answers WHERE s.email = :email")
    // Optional<Student> findByEmailWithHistory(@Param("email") String email);
    // ---------------------------------
}