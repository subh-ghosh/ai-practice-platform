package com.practice.aiplatform.notifications;

import com.practice.aiplatform.user.StudentLookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final StudentLookupService studentLookupService;

    public NotificationController(
            NotificationService notificationService,
            StudentLookupService studentLookupService) {
        this.notificationService = notificationService;
        this.studentLookupService = studentLookupService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(Principal principal) {
        try {
            Long studentId = studentLookupService.getRequiredStudentId(principal.getName());
            List<Notification> notifications = notificationService.getAllNotifications(studentId);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Principal principal) {
        try {
            Long studentId = studentLookupService.getRequiredStudentId(principal.getName());
            List<Notification> unreadNotifications = notificationService.getUnreadNotifications(studentId);
            return ResponseEntity.ok(unreadNotifications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(Principal principal) {
        try {
            Long studentId = studentLookupService.getRequiredStudentId(principal.getName());
            notificationService.markAllAsRead(studentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }
}
