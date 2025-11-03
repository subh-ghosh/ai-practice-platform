package com.practice.aiplatform.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This is the "owning" side of the many-to-one relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private Boolean isCorrect;

    private String evaluationStatus;

    @Column(columnDefinition = "TEXT")
    private String hint;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime submittedAt;

    // Automatically sets the timestamp when a new answer is created
    @PrePersist
    protected void onSubmit() {
        submittedAt = LocalDateTime.now();
    }
}