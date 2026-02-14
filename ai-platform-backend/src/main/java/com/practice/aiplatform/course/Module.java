package com.practice.aiplatform.course;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "modules")
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content; // The lesson text/content

    @Column(nullable = false)
    private boolean isCompleted = false; // Match DB schema

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonBackReference // Prevent infinite recursion
    private Course course;
}
