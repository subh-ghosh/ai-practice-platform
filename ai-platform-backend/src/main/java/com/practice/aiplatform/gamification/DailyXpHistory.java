package com.practice.aiplatform.gamification;

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
@Table(name = "daily_xp_history", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "date" })
}, indexes = {
        @Index(name = "idx_xp_history_student_date", columnList = "student_id, date")
})
public class DailyXpHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int xpEarned;

    public DailyXpHistory(Student student, LocalDate date, int xpEarned) {
        this.student = student;
        this.date = date;
        this.xpEarned = xpEarned;
    }
}
