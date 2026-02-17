package com.practice.aiplatform.statistics;

import com.practice.aiplatform.practice.Answer;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.practice.PracticeHistoryDto;
import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate; // <-- IMPORT
import java.util.List;
import java.util.Map; // <-- IMPORT
import java.util.stream.Collectors; // <-- IMPORT

@Service
public class StatisticsService {

        private final AnswerRepository answerRepository;
        private final StudentRepository studentRepository;

        public StatisticsService(AnswerRepository answerRepository, StudentRepository studentRepository) {
                this.answerRepository = answerRepository;
                this.studentRepository = studentRepository;
        }

        public StatisticsDto getStatistics(String email) {
                // ... (this entire method remains unchanged) ...
                Student student = studentRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                List<Answer> allAnswers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);
                long correctCount = allAnswers.stream()
                                .filter(a -> "CORRECT".equals(a.getEvaluationStatus()))
                                .count();
                long revealedCount = allAnswers.stream()
                                .filter(a -> "REVEALED".equals(a.getEvaluationStatus()))
                                .count();
                long incorrectCount = allAnswers.stream()
                                .filter(a -> List.of("INCORRECT", "CLOSE").contains(a.getEvaluationStatus()))
                                .count();
                long totalAttempts = allAnswers.size();
                long totalGraded = correctCount + incorrectCount;
                double accuracyPercentage = 0.0;
                if (totalGraded > 0) {
                        accuracyPercentage = ((double) correctCount / totalGraded) * 100.0;
                }
                List<Answer> gradedAnswers = allAnswers.stream()
                                .filter(a -> List.of("CORRECT", "INCORRECT", "CLOSE").contains(a.getEvaluationStatus())
                                                &&
                                                a.getQuestion() != null && a.getQuestion().getGeneratedAt() != null
                                                && a.getSubmittedAt() != null)
                                .toList();
                double averageAnswerTimeSeconds = 0.0;
                if (!gradedAnswers.isEmpty()) {
                        double totalSeconds = gradedAnswers.stream()
                                        .mapToLong(answer -> Duration.between(answer.getQuestion().getGeneratedAt(),
                                                        answer.getSubmittedAt()).toSeconds())
                                        .filter(seconds -> seconds > 0)
                                        .sum();
                        long validAnswerCount = gradedAnswers.stream()
                                        .filter(answer -> Duration.between(answer.getQuestion().getGeneratedAt(),
                                                        answer.getSubmittedAt()).toSeconds() > 0)
                                        .count();
                        if (validAnswerCount > 0) {
                                averageAnswerTimeSeconds = totalSeconds / validAnswerCount;
                        }
                }
                List<Answer> recentAnswers = allAnswers.stream().limit(5).toList();
                List<PracticeHistoryDto.QuestionAnswerDto> recentActivityList = recentAnswers.stream()
                                .map(answer -> {
                                        Question question = answer.getQuestion();
                                        return new PracticeHistoryDto.QuestionAnswerDto(
                                                        question.getId(),
                                                        question.getQuestionText(),
                                                        question.getSubject(),
                                                        question.getTopic(),
                                                        question.getDifficulty(),
                                                        question.getGeneratedAt(),
                                                        answer.getAnswerText(),
                                                        answer.getIsCorrect(),
                                                        answer.getEvaluationStatus(),
                                                        answer.getHint(),
                                                        answer.getFeedback(),
                                                        answer.getSubmittedAt());
                                })
                                .toList();
                return new StatisticsDto(
                                totalAttempts,
                                correctCount,
                                incorrectCount,
                                revealedCount,
                                accuracyPercentage,
                                averageAnswerTimeSeconds,
                                recentActivityList);
        }

        // --- ADD THIS ENTIRE NEW METHOD ---
        public List<DailyStatDto> getTimeSeriesStats(String email) {
                Student student = studentRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                // 1. Get all answers that can be graded (correct, incorrect, close)
                List<Answer> gradedAnswers = answerRepository
                                .findAllByStudentAndEvaluationStatusInOrderBySubmittedAtAsc(
                                                student,
                                                List.of("CORRECT", "INCORRECT", "CLOSE"));

                // 2. Group these answers by the date they were submitted
                Map<LocalDate, List<Answer>> answersByDay = gradedAnswers.stream()
                                .filter(a -> a.getSubmittedAt() != null)
                                .collect(Collectors.groupingBy(a -> a.getSubmittedAt().toLocalDate()));

                // 3. Process each day's answers into a DailyStatDto
                return answersByDay.entrySet().stream()
                                .sorted(Map.Entry.comparingByKey()) // <-- MOVE SORT HERE
                                .map(entry -> {
                                        LocalDate date = entry.getKey();
                                        List<Answer> dailyAnswers = entry.getValue();

                                        // Calculate daily accuracy
                                        long correctCount = dailyAnswers.stream()
                                                        .filter(a -> "CORRECT".equals(a.getEvaluationStatus()))
                                                        .count();
                                        int attempts = dailyAnswers.size();
                                        double accuracy = (attempts > 0) ? ((double) correctCount / attempts) * 100.0
                                                        : 0.0;

                                        // Calculate daily average speed
                                        double avgSpeed = dailyAnswers.stream()
                                                        .filter(a -> a.getQuestion() != null
                                                                        && a.getQuestion().getGeneratedAt() != null)
                                                        .mapToLong(a -> Duration
                                                                        .between(a.getQuestion().getGeneratedAt(),
                                                                                        a.getSubmittedAt())
                                                                        .toSeconds())
                                                        .filter(s -> s > 0)
                                                        .average()
                                                        .orElse(0.0); // Get average, or 0 if no valid times

                                        return new DailyStatDto(date, accuracy, avgSpeed, attempts);
                                })
                                // .sorted(Map.Entry.comparingByKey()) // <-- REMOVE FROM HERE
                                .toList();
        }

        // --- SMART RECOMMENDATIONS ---

        public record SmartRecommendationDto(List<String> recentTopics, List<String> weakTopics) {
        }

        public SmartRecommendationDto getSmartRecommendations(String email) {
                Student student = studentRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Student not found"));

                List<Answer> allAnswers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

                // 1. Recent Topics (unique, top 5)
                List<String> recentTopics = allAnswers.stream()
                                .map(a -> a.getQuestion().getTopic())
                                .distinct()
                                .limit(5)
                                .collect(Collectors.toList());

                // 2. Weak Topics (topics with < 60% accuracy, min 3 attempts)
                Map<String, List<Answer>> answersByTopic = allAnswers.stream()
                                .collect(Collectors.groupingBy(a -> a.getQuestion().getTopic()));

                List<String> weakTopics = answersByTopic.entrySet().stream()
                                .filter(entry -> {
                                        List<Answer> topicAnswers = entry.getValue();
                                        if (topicAnswers.size() < 3)
                                                return false; // Need enough data

                                        long correct = topicAnswers.stream()
                                                        .filter(a -> "CORRECT".equals(a.getEvaluationStatus()))
                                                        .count();
                                        double accuracy = (double) correct / topicAnswers.size();
                                        return accuracy < 0.6; // Less than 60% accuracy
                                })
                                .map(Map.Entry::getKey)
                                .limit(3)
                                .collect(Collectors.toList());

                return new SmartRecommendationDto(recentTopics, weakTopics);
        }
}