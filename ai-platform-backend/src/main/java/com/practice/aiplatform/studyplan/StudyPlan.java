package com.practice.aiplatform.studyplan;

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
@Table(name = "study_plans")
public class StudyPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String topic;
    private String difficulty; // Beginner, Intermediate, Advanced

    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int progress = 0;

    @Column(nullable = false)
    private boolean isCompleted = false;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @OneToMany(mappedBy = "studyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @OrderBy("orderIndex ASC")
    private List<StudyPlanItem> items = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    public void addItem(StudyPlanItem item) {
        items.add(item);
        item.setStudyPlan(this);
    }
}
