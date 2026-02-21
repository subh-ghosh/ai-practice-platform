package com.practice.aiplatform.notifications;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final StudentRepository studentRepository;

    public NotificationController(NotificationService notificationService, StudentRepository studentRepository) {
        this.notificationService = notificationService;
        this.studentRepository = studentRepository;
    }

    private Student getCurrentStudent(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        return studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(Principal principal) {
        try {
            Student student = getCurrentStudent(principal);
            List<Notification> notifications = notificationService.getAllNotifications(student.getId());
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Principal principal) {
        try {
            Student student = getCurrentStudent(principal);
            List<Notification> unreadNotifications = notificationService.getUnreadNotifications(student.getId());
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
            Student student = getCurrentStudent(principal);
            notificationService.markAllAsRead(student.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }
}