package com.practice.aiplatform.notifications;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(Long studentId, String type, String message) {
        Notification notification = new Notification(studentId, type, message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

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
        }
    }

    @Transactional
    public void markAllAsRead(Long studentId) {
        notificationRepository.markAllAsRead(studentId);
    }
}