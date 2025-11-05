package com.practice.aiplatform.notifications;

import com.practice.aiplatform.user.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    private final StudentRepository studentRepository;

    public NotificationController(NotificationService service, StudentRepository studentRepository) {
        this.service = service;
        this.studentRepository = studentRepository;
    }

    private Long currentStudentId(Principal principal) {
        if (principal == null) return null;
        return studentRepository.findByEmail(principal.getName())
                .map(s -> s.getId())
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> all(Principal principal) {
        Long sid = currentStudentId(principal);
        if (sid == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.list(sid));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> unread(Principal principal) {
        Long sid = currentStudentId(principal);
        if (sid == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.listUnread(sid));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        service.markRead(id);
        return ResponseEntity.noContent().build();
    }
}
