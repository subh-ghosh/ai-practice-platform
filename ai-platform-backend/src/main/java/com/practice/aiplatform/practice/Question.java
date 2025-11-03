package com.practice.aiplatform.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// --- ADD THESE ANNOTATIONS ---
@Getter
@Setter
@NoArgsConstructor
// -----------------------------
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // --- ADD THIS FIELD ---
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;
    // ----------------------

    // This is the "owning" side of the one-to-many relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    // This is the "inverse" side of the one-to-one relationship
    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Answer answer;

    // We can add a "pre-persist" method to set the timestamp automatically
    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}

