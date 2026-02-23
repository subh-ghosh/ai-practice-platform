package com.practice.aiplatform.notifications;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_student_created", columnList = "student_id, created_at"),
        @Index(name = "idx_notifications_student_read_created", columnList = "student_id, read_flag, created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false, length = 40)
    private String type;

    @Column(nullable = false, length = 300)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "read_flag", nullable = false)
    private boolean readFlag = false;

    public Notification(Long studentId, String type, String message) {
        this.studentId = studentId;
        this.type = type;
        this.message = message;
        this.createdAt = Instant.now();
        this.readFlag = false;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
