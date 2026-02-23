package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "study_plan_items", indexes = {
        @Index(name = "idx_items_plan_type_completed", columnList = "study_plan_id, item_type, is_completed"),
        @Index(name = "idx_items_practice_topic", columnList = "practice_topic")
})
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

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isCompleted = false;

    // --- Gamification ---
    @Column(name = "xp_reward", nullable = false, columnDefinition = "integer default 0")
    private int xpReward = 0; // VIDEO=10, PRACTICE=50

    // --- Quiz Questions (only for PRACTICE items) ---
    @OneToMany(mappedBy = "studyPlanItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("item-questions")
    @OrderBy("id ASC")
    private List<QuizQuestion> quizQuestions = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "study_plan_id")
    @JsonBackReference
    private StudyPlan studyPlan;
}
