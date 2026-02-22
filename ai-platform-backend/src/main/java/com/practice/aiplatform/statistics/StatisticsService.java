package com.practice.aiplatform.statistics;

import com.practice.aiplatform.practice.Answer;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.practice.PracticeHistoryDto;
import com.practice.aiplatform.practice.Question;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Service
public class StatisticsService {

    private final AnswerRepository answerRepository;
    private final StudentRepository studentRepository;

    public StatisticsService(AnswerRepository answerRepository, StudentRepository studentRepository) {
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
    }

    @Cacheable(value = "UserStatsSummaryCache", key = "#email", sync = true)
    public StatisticsDto getStatistics(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> allAnswers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        long correctCount = 0;
        long revealedCount = 0;
        long incorrectCount = 0;

        for (Answer answer : allAnswers) {
            String status = answer.getEvaluationStatus();

            if ("CORRECT".equals(status)) {
                correctCount++;
            } else if ("REVEALED".equals(status)) {
                revealedCount++;
            } else if ("INCORRECT".equals(status) || "CLOSE".equals(status)) {
                incorrectCount++;
            }
        }

        long totalAttempts = allAnswers.size();
        long totalGraded = correctCount + incorrectCount;

        double accuracyPercentage = 0.0;
        if (totalGraded > 0) {
            accuracyPercentage = ((double) correctCount / totalGraded) * 100.0;
        }

        double totalSeconds = 0;
        long validAnswerCount = 0;

        for (Answer answer : allAnswers) {
            String status = answer.getEvaluationStatus();

            boolean gradable = "CORRECT".equals(status) || "INCORRECT".equals(status) || "CLOSE".equals(status);
            if (!gradable) {
                continue;
            }

            if (answer.getQuestion() == null || answer.getQuestion().getGeneratedAt() == null || answer.getSubmittedAt() == null) {
                continue;
            }

            long seconds = Duration.between(answer.getQuestion().getGeneratedAt(), answer.getSubmittedAt()).toSeconds();
            if (seconds > 0) {
                totalSeconds += seconds;
                validAnswerCount++;
            }
        }

        double averageAnswerTimeSeconds = 0.0;
        if (validAnswerCount > 0) {
            averageAnswerTimeSeconds = totalSeconds / validAnswerCount;
        }

        List<PracticeHistoryDto.QuestionAnswerDto> recentActivityList = new ArrayList<>();
        int limit = Math.min(5, allAnswers.size());

        for (int i = 0; i < limit; i++) {
            Answer answer = allAnswers.get(i);
            Question question = answer.getQuestion();

            PracticeHistoryDto.QuestionAnswerDto dto = new PracticeHistoryDto.QuestionAnswerDto(
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
                    answer.getSubmittedAt()
            );

            recentActivityList.add(dto);
        }

        return new StatisticsDto(
                totalAttempts,
                correctCount,
                incorrectCount,
                revealedCount,
                accuracyPercentage,
                averageAnswerTimeSeconds,
                recentActivityList
        );
    }

    @Cacheable(value = "UserStatsTimeSeriesCache", key = "#email", sync = true)
    public List<DailyStatDto> getTimeSeriesStats(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> gradedAnswers = answerRepository.findAllByStudentAndEvaluationStatusInOrderBySubmittedAtAsc(
                student,
                List.of("CORRECT", "INCORRECT", "CLOSE")
        );

        Map<LocalDate, List<Answer>> answersByDay = new HashMap<>();

        for (Answer answer : gradedAnswers) {
            if (answer.getSubmittedAt() == null) {
                continue;
            }

            LocalDate day = answer.getSubmittedAt().toLocalDate();

            if (!answersByDay.containsKey(day)) {
                answersByDay.put(day, new ArrayList<>());
            }
            answersByDay.get(day).add(answer);
        }

        List<LocalDate> sortedDates = new ArrayList<>(answersByDay.keySet());
        Collections.sort(sortedDates);

        List<DailyStatDto> result = new ArrayList<>();

        for (LocalDate date : sortedDates) {
            List<Answer> dailyAnswers = answersByDay.get(date);

            long correctCount = 0;
            for (Answer answer : dailyAnswers) {
                if ("CORRECT".equals(answer.getEvaluationStatus())) {
                    correctCount++;
                }
            }

            int attempts = dailyAnswers.size();
            double accuracy = attempts > 0 ? ((double) correctCount / attempts) * 100.0 : 0.0;

            long speedCount = 0;
            double speedTotal = 0.0;

            for (Answer answer : dailyAnswers) {
                if (answer.getQuestion() == null || answer.getQuestion().getGeneratedAt() == null || answer.getSubmittedAt() == null) {
                    continue;
                }

                long seconds = Duration.between(answer.getQuestion().getGeneratedAt(), answer.getSubmittedAt()).toSeconds();
                if (seconds > 0) {
                    speedTotal += seconds;
                    speedCount++;
                }
            }

            double avgSpeed = speedCount > 0 ? speedTotal / speedCount : 0.0;

            result.add(new DailyStatDto(date, accuracy, avgSpeed, attempts));
        }

        return result;
    }

    public record SmartRecommendationDto(List<String> recentTopics, List<String> weakTopics) {
    }

    @Cacheable(value = "UserStatsRecommendationsCache", key = "#email", sync = true)
    public SmartRecommendationDto getSmartRecommendations(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> allAnswers = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        List<String> recentTopics = new ArrayList<>();
        Set<String> seenRecentTopics = new HashSet<>();

        for (Answer answer : allAnswers) {
            if (answer.getQuestion() == null || answer.getQuestion().getTopic() == null) {
                continue;
            }

            String topic = answer.getQuestion().getTopic();
            if (!seenRecentTopics.contains(topic)) {
                seenRecentTopics.add(topic);
                recentTopics.add(topic);
            }

            if (recentTopics.size() == 5) {
                break;
            }
        }

        Map<String, List<Answer>> answersByTopic = new HashMap<>();

        for (Answer answer : allAnswers) {
            if (answer.getQuestion() == null || answer.getQuestion().getTopic() == null) {
                continue;
            }

            String topic = answer.getQuestion().getTopic();
            if (!answersByTopic.containsKey(topic)) {
                answersByTopic.put(topic, new ArrayList<>());
            }
            answersByTopic.get(topic).add(answer);
        }

        List<String> weakTopics = new ArrayList<>();

        for (Map.Entry<String, List<Answer>> entry : answersByTopic.entrySet()) {
            if (weakTopics.size() == 3) {
                break;
            }

            String topic = entry.getKey();
            List<Answer> topicAnswers = entry.getValue();

            if (topicAnswers.size() < 3) {
                continue;
            }

            long correct = 0;
            for (Answer answer : topicAnswers) {
                if ("CORRECT".equals(answer.getEvaluationStatus())) {
                    correct++;
                }
            }

            double accuracy = (double) correct / topicAnswers.size();
            if (accuracy < 0.6) {
                weakTopics.add(topic);
            }
        }

        return new SmartRecommendationDto(recentTopics, weakTopics);
    }
}