package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class XpService {

    private final StudentRepository studentRepository;
    private final DailyXpHistoryRepository dailyXpHistoryRepository;

    public XpService(StudentRepository studentRepository, DailyXpHistoryRepository dailyXpHistoryRepository) {
        this.studentRepository = studentRepository;
        this.dailyXpHistoryRepository = dailyXpHistoryRepository;
    }

    @Transactional
    public void awardXp(Student student, int amount) {
        if (amount <= 0)
            return;

        // 1. Update Student Total XP
        student.setTotalXp(student.getTotalXp() + amount);
        studentRepository.save(student);

        // 2. Update Daily XP History
        LocalDate today = LocalDate.now();
        DailyXpHistory history = dailyXpHistoryRepository.findByStudentIdAndDate(student.getId(), today)
                .orElse(new DailyXpHistory(student, today, 0));

        history.setXpEarned(history.getXpEarned() + amount);
        dailyXpHistoryRepository.save(history);
    }

    public List<DailyXpHistory> getXpHistory(Long studentId, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        return dailyXpHistoryRepository.findByStudentIdAndDateBetweenOrderByDateAsc(studentId, startDate, endDate);
    }
}
