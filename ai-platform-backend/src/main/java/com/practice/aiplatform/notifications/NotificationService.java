package com.practice.aiplatform.notifications;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CacheManager cacheManager;

    public NotificationService(NotificationRepository notificationRepository, CacheManager cacheManager) {
        this.notificationRepository = notificationRepository;
        this.cacheManager = cacheManager;
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "UserNotificationAllCache", key = "#studentId"),
            @CacheEvict(value = "UserNotificationUnreadCache", key = "#studentId")
    })
    public Notification createNotification(Long studentId, String type, String message) {
        Notification notification = new Notification(studentId, type, message);
        return notificationRepository.save(notification);
    }

    @Cacheable(value = "UserNotificationAllCache", key = "#studentId", sync = true)
    public List<Notification> getAllNotifications(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Cacheable(value = "UserNotificationUnreadCache", key = "#studentId", sync = true)
    public List<Notification> getUnreadNotifications(Long studentId) {
        return notificationRepository.findUnread(studentId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);

        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setReadFlag(true);
            notificationRepository.save(notification);
            evictNotificationCaches(notification.getStudentId());
        }
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "UserNotificationAllCache", key = "#studentId"),
            @CacheEvict(value = "UserNotificationUnreadCache", key = "#studentId")
    })
    public void markAllAsRead(Long studentId) {
        notificationRepository.markAllAsRead(studentId);
    }

    private void evictNotificationCaches(Long studentId) {
        Cache allCache = cacheManager.getCache("UserNotificationAllCache");
        Cache unreadCache = cacheManager.getCache("UserNotificationUnreadCache");
        if (allCache != null) {
            allCache.evict(studentId);
        }
        if (unreadCache != null) {
            unreadCache.evict(studentId);
        }
    }
}
