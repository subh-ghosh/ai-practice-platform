package com.practice.aiplatform.notifications;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(nullable = false, length = 40)
    private String type; // LOGIN, REGISTER, PROFILE_UPDATED

    @Column(nullable = false, length = 300)
    private String message;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "read_flag", nullable = false)
    private boolean readFlag; // default false

    public Notification() {}

    public Notification(Long studentId, String type, String message) {
        this.studentId = studentId;
        this.type = type;
        this.message = message;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        // readFlag defaults false for primitive boolean
    }

    // getters/setters
    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public String getType() { return type; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isReadFlag() { return readFlag; }

    public void setId(Long id) { this.id = id; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setType(String type) { this.type = type; }
    public void setMessage(String message) { this.message = message; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setReadFlag(boolean readFlag) { this.readFlag = readFlag; }
}
