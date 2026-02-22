package com.practice.aiplatform.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, Long> {
    List<DailyChallenge> findByStudentIdAndDate(Long studentId, LocalDate date);

    void deleteByDateBefore(LocalDate date);

    long deleteByStudentId(Long studentId);
}
