package com.practice.aiplatform.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * This is the Repository interface for our Student entity.
 * It gives us all the built-in database operations (save, find, delete, etc.).
 */
@Repository // Tells Spring this is a bean that should be managed
public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Spring Data JPA is smart. By simply defining this method,
     * it will automatically generate the SQL query:
     * "SELECT * FROM students WHERE email = ?"
     *
     * We use Optional in case no student is found with that email.
     */
    Optional<Student> findByEmail(String email);

}
