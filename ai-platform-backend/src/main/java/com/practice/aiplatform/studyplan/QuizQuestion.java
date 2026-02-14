package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String optionA;

    @Column(nullable = false)
    private String optionB;

    @Column(nullable = false)
    private String optionC;

    @Column(nullable = false)
    private String optionD;

    @JsonIgnore // Don't expose correct answer to frontend by default
    @Column(name = "correct_option", nullable = false)
    private String correctOption; // "A", "B", "C", or "D"

    @ManyToOne
    @JoinColumn(name = "study_plan_item_id")
    @JsonBackReference("item-questions")
    private StudyPlanItem studyPlanItem;
}
