package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;

    public BadgeService(UserBadgeRepository userBadgeRepository) {
        this.userBadgeRepository = userBadgeRepository;
    }

    public List<UserBadge> getUserBadges(Long studentId) {
        return userBadgeRepository.findByStudentId(studentId);
    }

    @Transactional
    public void checkForBadges(Student student) {
        // 1. FIRST_STEPS: Check if user has any study plans
        // (This check happens where we have access to study plans, or we can check here
        // if we inject StudyPlanRepo)
        // For simplicity, we'll trigger specific badge checks from relevant events.
    }

    @Transactional
    public void unlockBadge(Student student, Badge badge) {
        if (!userBadgeRepository.existsByStudentIdAndBadge(student.getId(), badge)) {
            UserBadge userBadge = new UserBadge(student, badge);
            userBadgeRepository.save(userBadge);
            System.out.println("🏆 Badge Unlocked: " + badge.getDisplayName() + " for user " + student.getEmail());
        }
    }

    // --- Badge Logic Triggers ---

    @Transactional
    public void checkUseTimeBadges(Student student) {
        LocalTime now = LocalTime.now();
        if (now.isBefore(LocalTime.of(8, 0))) {
            unlockBadge(student, Badge.EARLY_BIRD);
        }
        if (now.isAfter(LocalTime.of(22, 0))) {
            unlockBadge(student, Badge.NIGHT_OWL);
        }
    }

    @Transactional
    public void checkStreakBadges(Student student) {
        if (student.getStreakDays() >= 7) {
            unlockBadge(student, Badge.STREAK_WARRIOR);
        }
    }
}
