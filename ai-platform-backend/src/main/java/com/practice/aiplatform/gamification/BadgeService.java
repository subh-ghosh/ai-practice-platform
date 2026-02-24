package com.practice.aiplatform.gamification;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.practice.aiplatform.user.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;

@Service
public class BadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final Cache<Long, List<UserBadge>> localBadgeCache;
    @Lazy
    @Autowired
    private BadgeService self;

    public BadgeService(UserBadgeRepository userBadgeRepository) {
        this.userBadgeRepository = userBadgeRepository;
        this.localBadgeCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(30))
                .maximumSize(2000)
                .build();
    }

    public List<UserBadge> getUserBadges(Long studentId) {
        List<UserBadge> cached = localBadgeCache.getIfPresent(studentId);
        if (cached != null) {
            return cached;
        }

        List<UserBadge> value = self.getUserBadgesCached(studentId);
        localBadgeCache.put(studentId, value);
        return value;
    }

    @Cacheable(value = "UserBadgesCache", key = "#studentId", sync = true)
    public List<UserBadge> getUserBadgesCached(Long studentId) {
        return userBadgeRepository.findByStudentId(studentId);
    }

    @CacheEvict(value = "UserBadgesCache", key = "#student.id")
    @Transactional
    public void unlockBadge(Student student, Badge badge) {
        boolean alreadyUnlocked = userBadgeRepository.existsByStudentIdAndBadge(student.getId(), badge);
        if (alreadyUnlocked) {
            return;
        }

        UserBadge userBadge = new UserBadge(student, badge);
        userBadgeRepository.save(userBadge);
        localBadgeCache.invalidate(student.getId());
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
