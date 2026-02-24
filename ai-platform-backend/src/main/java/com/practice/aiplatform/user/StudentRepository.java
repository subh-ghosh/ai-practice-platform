package com.practice.aiplatform.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    @Query("select s.id from Student s where s.email = :email")
    Optional<Long> findIdByEmail(@Param("email") String email);

    // Leaderboard query
    List<Student> findTop10ByOrderByTotalXpDesc();
}
