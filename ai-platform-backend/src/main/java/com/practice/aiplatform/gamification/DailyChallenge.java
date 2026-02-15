package com.practice.aiplatform.gamification;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.user.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "daily_challenges")
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private int xpReward;

    @Column(nullable = false)
    private int targetAmount; // e.g., 3 quizzes

    @Column(nullable = false)
    private int currentAmount; // e.g., 1 quiz done

    @Column(nullable = false)
    private boolean claimed;

    @Column(nullable = false)
    private LocalDate date; // To check if it's today's challenge

    public DailyChallenge(Student student, String title, String description, int xpReward, int targetAmount) {
        this.student = student;
        this.title = title;
        this.description = description;
        this.xpReward = xpReward;
        this.targetAmount = targetAmount;
        this.currentAmount = 0;
        this.claimed = false;
        this.date = LocalDate.now();
    }
}
