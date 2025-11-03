package com.practice.aiplatform.practice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter // <-- Generates all getter methods (e.g., getSubmittedAt())
@Setter // <-- Generates all setter methods (e.g., setSubmittedAt(...))
@NoArgsConstructor // <-- Generates a default constructor
@Entity
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This is the "owning" side of the one-to-one relationship
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    @JsonIgnore
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private Boolean isCorrect;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime submittedAt;
}

