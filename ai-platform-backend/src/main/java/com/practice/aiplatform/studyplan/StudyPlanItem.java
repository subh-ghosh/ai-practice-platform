package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "study_plan_items")
public class StudyPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "VIDEO" or "PRACTICE"
    @Column(name = "item_type", nullable = false)
    private String itemType;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- Video fields (null for PRACTICE items) ---
    private String videoId;
    private String videoUrl;
    private String thumbnailUrl;
    private String channelName;
    private String videoDuration; // ISO 8601 duration e.g. "PT15M33S"

    // --- Practice fields (null for VIDEO items) ---
    private String practiceSubject;
    private String practiceTopic;
    private String practiceDifficulty;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private boolean isCompleted = false;

    @ManyToOne
    @JoinColumn(name = "study_plan_id")
    @JsonBackReference
    private StudyPlan studyPlan;
}
