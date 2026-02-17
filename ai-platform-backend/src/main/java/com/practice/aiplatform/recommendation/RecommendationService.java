package com.practice.aiplatform.recommendation;

import com.practice.aiplatform.practice.Answer;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.studyplan.StudyPlanItem;
import com.practice.aiplatform.studyplan.StudyPlanItemRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final AnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final StudyPlanItemRepository studyPlanItemRepository;

    public RecommendationService(AnswerRepository answerRepository,
            StudentRepository studentRepository,
            StudyPlanItemRepository studyPlanItemRepository) {
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
        this.studyPlanItemRepository = studyPlanItemRepository;
    }

    // ===== Enhanced Recommendation Record =====

    public record EnhancedRecommendation(
            String type, // WEAKNESS, DECLINING, MASTERED, READY_TO_ADVANCE, STALE, PLAN_GAP
            String topic,
            String currentDifficulty,
            String suggestedDifficulty,
            double accuracy,
            String trend, // IMPROVING, DECLINING, STABLE
            String reason,
            String action,
            String actionType, // PRACTICE, STUDY_PLAN, REVIEW
            String deepLink) {
    }

    // ===== Prediction Record (unchanged) =====

    public record Prediction(String topic, String difficulty, double winProbability, String confidence) {
    }

    // ===== Enhanced Recommendations =====

    public List<EnhancedRecommendation> getRecommendations(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);
        if (history.isEmpty()) {
            return List.of(new EnhancedRecommendation(
                    "READY_TO_ADVANCE", "Java", "Beginner", "Beginner",
                    0.0, "STABLE",
                    "Welcome! Start your learning journey.",
                    "Begin with a Beginner Java quiz",
                    "PRACTICE",
                    "/dashboard/practice?subject=Java&topic=Object+Oriented+Programming&difficulty=School"));
        }

        // Group answers by topic
        Map<String, List<Answer>> topicStats = history.stream()
                .filter(a -> a.getQuestion() != null && a.getQuestion().getTopic() != null)
                .collect(Collectors.groupingBy(a -> a.getQuestion().getTopic()));

        List<EnhancedRecommendation> recommendations = new ArrayList<>();

        for (Map.Entry<String, List<Answer>> entry : topicStats.entrySet()) {
            String topic = entry.getKey();
            List<Answer> answers = entry.getValue();
            if (answers.isEmpty())
                continue;

            // --- Calculate overall accuracy ---
            long gradable = answers.stream()
                    .filter(a -> List.of("CORRECT", "INCORRECT", "CLOSE").contains(a.getEvaluationStatus()))
                    .count();
            long correct = answers.stream().filter(a -> "CORRECT".equals(a.getEvaluationStatus())).count();
            double accuracy = gradable > 0 ? (double) correct / gradable : 0.0;

            // --- Calculate trend (last 5 vs prior 5) ---
            String trend = calculateTrend(answers);

            // --- Determine most common difficulty for this topic ---
            String commonDifficulty = answers.stream()
                    .filter(a -> a.getQuestion() != null && a.getQuestion().getDifficulty() != null)
                    .collect(Collectors.groupingBy(a -> a.getQuestion().getDifficulty(), Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Beginner");

            // --- Most recent answer timestamp ---
            LocalDateTime lastPracticed = answers.stream()
                    .filter(a -> a.getSubmittedAt() != null)
                    .map(Answer::getSubmittedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(LocalDateTime.now());

            long daysSinceLastPractice = ChronoUnit.DAYS.between(lastPracticed, LocalDateTime.now());

            // === STALE: No practice in 7+ days ===
            if (daysSinceLastPractice >= 7 && gradable >= 3) {
                recommendations.add(new EnhancedRecommendation(
                        "STALE", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        String.format("Last practiced %d days ago — time for a refresher!", daysSinceLastPractice),
                        "Quick refresher session",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
                continue; // Don't double-report
            }

            // === WEAKNESS: Accuracy < 60%, ≥ 3 attempts ===
            if (accuracy < 0.6 && gradable >= 3) {
                recommendations.add(new EnhancedRecommendation(
                        "WEAKNESS", topic, commonDifficulty, "School",
                        accuracy, trend,
                        String.format("Accuracy: %.0f%% — needs focused practice", accuracy * 100),
                        "Review basics and take a recovery quiz",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=School"));
            }
            // === DECLINING: Trend is declining even if overall accuracy is okay ===
            else if ("DECLINING".equals(trend) && gradable >= 6) {
                recommendations.add(new EnhancedRecommendation(
                        "DECLINING", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        String.format("Accuracy: %.0f%% but declining — slipping recently", accuracy * 100),
                        "Do a focused review before moving on",
                        "REVIEW",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
            }
            // === MASTERED: Accuracy > 90%, ≥ 10 attempts ===
            else if (accuracy > 0.9 && gradable >= 10) {
                String nextDiff = getNextDifficulty(commonDifficulty);
                recommendations.add(new EnhancedRecommendation(
                        "MASTERED", topic, commonDifficulty, nextDiff,
                        accuracy, trend,
                        String.format("Accuracy: %.0f%% — you've mastered this!", accuracy * 100),
                        "Challenge yourself at " + nextDiff + " level",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(nextDiff)));
            }
            // === READY_TO_ADVANCE: Accuracy 70-90%, ≥ 5 attempts ===
            else if (accuracy >= 0.7 && accuracy <= 0.9 && gradable >= 5) {
                recommendations.add(new EnhancedRecommendation(
                        "READY_TO_ADVANCE", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        String.format("Accuracy: %.0f%% — almost there!", accuracy * 100),
                        "One more round to solidify your understanding",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
            }
        }

        // === PLAN_GAP: Topics in active study plan but never practiced ===
        try {
            List<StudyPlanItem> activePlanItems = studyPlanItemRepository
                    .findAllByStudyPlanStudentIdAndStudyPlanIsCompletedFalse(student.getId());

            Set<String> practicedTopics = topicStats.keySet().stream()
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());

            activePlanItems.stream()
                    .filter(item -> item.getPracticeTopic() != null)
                    .map(StudyPlanItem::getPracticeTopic)
                    .distinct()
                    .filter(planTopic -> !practicedTopics.contains(planTopic.toLowerCase()))
                    .limit(3)
                    .forEach(planTopic -> recommendations.add(new EnhancedRecommendation(
                            "PLAN_GAP", planTopic, "Beginner", "Beginner",
                            0.0, "STABLE",
                            "This topic is in your study plan but hasn't been practiced yet",
                            "Start practicing to stay on track",
                            "PRACTICE",
                            "/dashboard/practice?topic=" + encode(planTopic))));
        } catch (Exception e) {
            // Gracefully ignore if plan data unavailable
            System.err.println("Plan gap analysis failed: " + e.getMessage());
        }

        // Sort: WEAKNESS > DECLINING > STALE > PLAN_GAP > READY_TO_ADVANCE > MASTERED
        Map<String, Integer> priority = Map.of(
                "WEAKNESS", 0, "DECLINING", 1, "STALE", 2,
                "PLAN_GAP", 3, "READY_TO_ADVANCE", 4, "MASTERED", 5);
        recommendations.sort(Comparator.comparingInt(r -> priority.getOrDefault(r.type(), 99)));

        return recommendations.isEmpty()
                ? List.of(new EnhancedRecommendation(
                        "READY_TO_ADVANCE", "New Topic", "Beginner", "Beginner",
                        0.0, "STABLE",
                        "You're doing great! Keep exploring.",
                        "Try a new topic to expand your skills",
                        "PRACTICE",
                        "/dashboard/practice"))
                : recommendations;
    }

    // ===== AI Coach Summary (raw data for Gemini prompt) =====

    public String buildAiCoachPromptData(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> recent = answerRepository.findTop20ByStudentOrderBySubmittedAtDesc(student);
        if (recent.isEmpty()) {
            return null; // No data for coaching
        }

        // Build a concise summary for the AI
        StringBuilder summary = new StringBuilder();
        summary.append("Student's last 20 practice results:\n");

        Map<String, List<Answer>> byTopic = recent.stream()
                .filter(a -> a.getQuestion() != null)
                .collect(Collectors.groupingBy(a -> a.getQuestion().getTopic()));

        for (Map.Entry<String, List<Answer>> entry : byTopic.entrySet()) {
            long correct = entry.getValue().stream()
                    .filter(a -> "CORRECT".equals(a.getEvaluationStatus())).count();
            long total = entry.getValue().stream()
                    .filter(a -> List.of("CORRECT", "INCORRECT", "CLOSE").contains(a.getEvaluationStatus()))
                    .count();
            double acc = total > 0 ? (double) correct / total * 100 : 0;
            summary.append(String.format("- %s: %.0f%% accuracy (%d/%d correct)\n",
                    entry.getKey(), acc, correct, total));
        }

        return summary.toString();
    }

    // ===== Prediction (unchanged) =====

    public Prediction predictSuccess(String userEmail, String topic, String difficulty) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student);

        List<Answer> topicHistory = history.stream()
                .filter(a -> a.getQuestion() != null && a.getQuestion().getTopic() != null)
                .filter(a -> a.getQuestion().getTopic().equalsIgnoreCase(topic))
                .limit(20)
                .toList();

        if (topicHistory.isEmpty()) {
            return new Prediction(topic, difficulty, 0.5, "LOW_DATA");
        }

        double totalWeight = 0;
        double weightedScore = 0;

        for (int i = 0; i < topicHistory.size(); i++) {
            Answer a = topicHistory.get(i);
            double weight = topicHistory.size() - i;
            double score = "CORRECT".equals(a.getEvaluationStatus()) ? 1.0 : 0.0;
            weightedScore += score * weight;
            totalWeight += weight;
        }

        double probability = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

        if ("Hard".equalsIgnoreCase(difficulty) || "Research".equalsIgnoreCase(difficulty)
                || "Post Graduation".equalsIgnoreCase(difficulty)) {
            probability *= 0.8;
        }

        String confidence = topicHistory.size() > 10 ? "HIGH" : "MEDIUM";
        return new Prediction(topic, difficulty, probability, confidence);
    }

    // ===== Helper Methods =====

    private String calculateTrend(List<Answer> answers) {
        List<Answer> gradable = answers.stream()
                .filter(a -> List.of("CORRECT", "INCORRECT", "CLOSE").contains(a.getEvaluationStatus()))
                .toList();

        if (gradable.size() < 6)
            return "STABLE";

        // Last 5 answers (most recent)
        List<Answer> recent = gradable.subList(0, Math.min(5, gradable.size()));
        long recentCorrect = recent.stream().filter(a -> "CORRECT".equals(a.getEvaluationStatus())).count();
        double recentAcc = (double) recentCorrect / recent.size();

        // Prior 5 answers
        List<Answer> prior = gradable.subList(Math.min(5, gradable.size()),
                Math.min(10, gradable.size()));
        if (prior.isEmpty())
            return "STABLE";

        long priorCorrect = prior.stream().filter(a -> "CORRECT".equals(a.getEvaluationStatus())).count();
        double priorAcc = (double) priorCorrect / prior.size();

        double diff = recentAcc - priorAcc;
        if (diff > 0.15)
            return "IMPROVING";
        if (diff < -0.15)
            return "DECLINING";
        return "STABLE";
    }

    private String getNextDifficulty(String current) {
        return switch (current) {
            case "School" -> "High School";
            case "High School" -> "Graduation";
            case "Graduation" -> "Post Graduation";
            case "Post Graduation" -> "Research";
            case "Beginner" -> "Intermediate";
            case "Intermediate" -> "Advanced";
            default -> "Hard";
        };
    }

    private String encode(String value) {
        if (value == null)
            return "";
        return value.replace(" ", "+");
    }
}
