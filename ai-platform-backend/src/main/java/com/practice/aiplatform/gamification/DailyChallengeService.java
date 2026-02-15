package com.practice.aiplatform.gamification;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class DailyChallengeService {

    private final DailyChallengeRepository dailyChallengeRepository;
    private final StudentRepository studentRepository;
    private final XpService xpService;

    public DailyChallengeService(DailyChallengeRepository dailyChallengeRepository,
            StudentRepository studentRepository,
            XpService xpService) {
        this.dailyChallengeRepository = dailyChallengeRepository;
        this.studentRepository = studentRepository;
        this.xpService = xpService;
    }

    public List<DailyChallenge> getTodayChallenges(Long studentId) {
        LocalDate today = LocalDate.now();
        List<DailyChallenge> challenges = dailyChallengeRepository.findByStudentIdAndDate(studentId, today);

        if (challenges.isEmpty()) {
            Student student = studentRepository.findById(studentId).orElseThrow();
            return generateDailyChallenges(student);
        }
        return challenges;
    }

    @Transactional
    public List<DailyChallenge> generateDailyChallenges(Student student) {
        // Generate 3 random challenges for the day
        createChallenge(student, "Quiz Master", "Complete 1 Quiz with >80% score", 50, 1);
        createChallenge(student, "Fast Learner", "Complete 3 Practice Questions", 30, 3);
        createChallenge(student, "Dedication", "Login and view a Study Plan", 20, 1);

        return dailyChallengeRepository.findByStudentIdAndDate(student.getId(), LocalDate.now());
    }

    private void createChallenge(Student student, String title, String description, int xp, int target) {
        DailyChallenge challenge = new DailyChallenge(student, title, description, xp, target);
        dailyChallengeRepository.save(challenge);
    }

    @Transactional
    public void incrementProgress(Long studentId, String challengeTitle, int amount) {
        LocalDate today = LocalDate.now();
        List<DailyChallenge> challenges = dailyChallengeRepository.findByStudentIdAndDate(studentId, today);

        for (DailyChallenge challenge : challenges) {
            if (challenge.getTitle().equalsIgnoreCase(challengeTitle) && !challenge.isClaimed()) {
                challenge
                        .setCurrentAmount(Math.min(challenge.getCurrentAmount() + amount, challenge.getTargetAmount()));
                dailyChallengeRepository.save(challenge);
            }
        }
    }

    @Transactional
    public void claimReward(Long challengeId) {
        DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (challenge.isClaimed()) {
            throw new RuntimeException("Already claimed");
        }
        if (challenge.getCurrentAmount() < challenge.getTargetAmount()) {
            throw new RuntimeException("Challenge not completed yet");
        }

        challenge.setClaimed(true);
        dailyChallengeRepository.save(challenge);

        // Add XP to student via XpService
        Student student = challenge.getStudent();
        xpService.awardXp(student, challenge.getXpReward());
    }

    // Cron job to clean up old challenges (Optional, or just generate on demand)
    @Scheduled(cron = "0 0 0 * * ?") // Midnight
    public void cleanupOldChallenges() {
        // Could implement cleanup here if needed
    }
}
