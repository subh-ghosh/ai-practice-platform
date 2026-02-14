package com.practice.aiplatform.course;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String topic;
    private String difficultyInfo; // e.g., "Beginner", "Intermediate"

    @Column(nullable = false)
    private boolean isCompleted = false; // Fix: Initialize to false to satisfy DB not-null constraint

    @Column(columnDefinition = "TEXT")
    private String description; // Optional: Brief summary

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Prevent infinite recursion
    private List<Module> modules = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    // Helper to add modules
    public void addModule(Module module) {
        modules.add(module);
        module.setCourse(this);
    }
}
