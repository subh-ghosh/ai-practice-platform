package com.practice.aiplatform.notifications;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CacheManager cacheManager;
    private final Cache<Long, List<Notification>> localAllCache;
    private final Cache<Long, List<Notification>> localUnreadCache;

    public NotificationService(NotificationRepository notificationRepository, CacheManager cacheManager) {
        this.notificationRepository = notificationRepository;
        this.cacheManager = cacheManager;
        this.localAllCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(30))
                .maximumSize(1000)
                .build();
        this.localUnreadCache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(30))
                .maximumSize(1000)
                .build();
    }

    @Transactional
    public Notification createNotification(Long studentId, String type, String message) {
        Notification notification = new Notification(studentId, type, message);
        Notification saved = notificationRepository.save(notification);
        evictNotificationCaches(studentId);
        return saved;
    }

    public List<Notification> getAllNotifications(Long studentId) {
        List<Notification> cached = localAllCache.getIfPresent(studentId);
        if (cached != null) {
            return cached;
        }

        org.springframework.cache.Cache redisCache = cacheManager.getCache("UserNotificationsAllCache");
        if (redisCache != null) {
            try {
                org.springframework.cache.Cache.ValueWrapper wrapper = redisCache.get(studentId);
                if (wrapper != null) {
                    @SuppressWarnings("unchecked")
                    List<Notification> value = (List<Notification>) wrapper.get();
                    if (value != null) {
                        localAllCache.put(studentId, value);
                        return value;
                    }
                }
            } catch (RuntimeException ignored) {
            }
        }

        List<Notification> value = notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (redisCache != null) {
            try {
                redisCache.put(studentId, value);
            } catch (RuntimeException ignored) {
            }
        }
        localAllCache.put(studentId, value);
        return value;
    }

    public List<Notification> getUnreadNotifications(Long studentId) {
        List<Notification> cached = localUnreadCache.getIfPresent(studentId);
        if (cached != null) {
            return cached;
        }

        org.springframework.cache.Cache redisCache = cacheManager.getCache("UserNotificationsUnreadCache");
        if (redisCache != null) {
            try {
                org.springframework.cache.Cache.ValueWrapper wrapper = redisCache.get(studentId);
                if (wrapper != null) {
                    @SuppressWarnings("unchecked")
                    List<Notification> value = (List<Notification>) wrapper.get();
                    if (value != null) {
                        localUnreadCache.put(studentId, value);
                        return value;
                    }
                }
            } catch (RuntimeException ignored) {
            }
        }

        List<Notification> value = notificationRepository.findUnread(studentId);
        if (redisCache != null) {
            try {
                redisCache.put(studentId, value);
            } catch (RuntimeException ignored) {
            }
        }
        localUnreadCache.put(studentId, value);
        return value;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);

        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setReadFlag(true);
            notificationRepository.save(notification);
            evictUnreadCache(notification.getStudentId());
        }
    }

    @Transactional
    public void markAllAsRead(Long studentId) {
        notificationRepository.markAllAsRead(studentId);
        evictUnreadCache(studentId);
    }

    private void evictNotificationCaches(Long studentId) {
        localAllCache.invalidate(studentId);
        localUnreadCache.invalidate(studentId);

        org.springframework.cache.Cache allCache = cacheManager.getCache("UserNotificationsAllCache");
        if (allCache != null) {
            allCache.evict(studentId);
        }

        org.springframework.cache.Cache unreadCache = cacheManager.getCache("UserNotificationsUnreadCache");
        if (unreadCache != null) {
            unreadCache.evict(studentId);
        }
    }

    private void evictUnreadCache(Long studentId) {
        localUnreadCache.invalidate(studentId);

        org.springframework.cache.Cache unreadCache = cacheManager.getCache("UserNotificationsUnreadCache");
        if (unreadCache != null) {
            unreadCache.evict(studentId);
        }
    }
}
