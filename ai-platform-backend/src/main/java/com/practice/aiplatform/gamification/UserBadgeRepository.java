package com.practice.aiplatform.gamification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByStudentId(Long studentId);

    boolean existsByStudentIdAndBadge(Long studentId, Badge badge);

    long deleteByStudentId(Long studentId);
}
