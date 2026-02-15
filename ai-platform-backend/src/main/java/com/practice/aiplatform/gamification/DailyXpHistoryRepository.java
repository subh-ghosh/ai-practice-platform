package com.practice.aiplatform.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyXpHistoryRepository extends JpaRepository<DailyXpHistory, Long> {
    Optional<DailyXpHistory> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<DailyXpHistory> findByStudentIdAndDateBetweenOrderByDateAsc(Long studentId, LocalDate startDate,
            LocalDate endDate);
}
