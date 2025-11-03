package com.practice.aiplatform.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Tells Spring this is a Repository bean
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Spring Data JPA gives us save(), findById(), etc. for free.
    // We can add custom query methods here later if needed,
    // e.g., finding all questions for a specific student.

}
