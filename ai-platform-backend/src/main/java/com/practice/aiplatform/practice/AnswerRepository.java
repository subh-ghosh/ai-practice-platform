package com.practice.aiplatform.practice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Tells Spring this is a Repository bean
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    // Spring Data JPA gives us save(), findById(), etc. for free.

}
