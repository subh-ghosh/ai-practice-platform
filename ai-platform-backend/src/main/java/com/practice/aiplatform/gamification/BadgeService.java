package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable(value = "UserBadgesCache", key = "#studentId", sync = true)
    public List<UserBadge> getUserBadges(Long studentId) {
        return userBadgeRepository.findByStudentId(studentId);
    }

    @Transactional
    @CacheEvict(value = "UserBadgesCache", key = "#student.id")
    public void unlockBadge(Student student, Badge badge) {
        boolean alreadyUnlocked = userBadgeRepository.existsByStudentIdAndBadge(student.getId(), badge);
        if (alreadyUnlocked) {
            return;
        }

        UserBadge userBadge = new UserBadge(student, badge);
        userBadgeRepository.save(userBadge);
    }

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
