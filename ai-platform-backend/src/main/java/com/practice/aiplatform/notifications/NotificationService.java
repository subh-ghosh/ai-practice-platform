package com.practice.aiplatform.notifications;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {
    
    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Notification notify(Long studentId, String type, String message) {
        return repo.save(new Notification(studentId, type, message));
    }

    public List<Notification> list(Long studentId) {
        return repo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public List<Notification> listUnread(Long studentId) {
        return repo.findUnread(studentId);
    }

    @Transactional
    public void markRead(Long id) {
        repo.findById(id).ifPresent(n -> { n.setReadFlag(true); repo.save(n); });
    }

    // --- 👇 NEW METHOD ---
    @Transactional
    public void markAllRead(Long studentId) {
        repo.markAllAsRead(studentId);
    }
}