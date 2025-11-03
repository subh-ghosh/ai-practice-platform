package com.practice.aiplatform.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set; // Make sure to import java.util.Set

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    // These columns are nullable to support create-drop
    @Column
    private String subject;

    @Column
    private String topic;

    @Column
    private String difficulty;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    // This is the "inverse" side of the one-to-many relationship
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Answer> answers;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}