package com.practice.aiplatform.recommendation;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.practice.aiplatform.practice.Answer;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.studyplan.StudyPlanItem;
import com.practice.aiplatform.studyplan.StudyPlanItemRepository;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.PageRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class RecommendationService {

    private final AnswerRepository answerRepository;
    private final StudentRepository studentRepository;
    private final StudyPlanItemRepository studyPlanItemRepository;

    public RecommendationService(
            AnswerRepository answerRepository,
            StudentRepository studentRepository,
            StudyPlanItemRepository studyPlanItemRepository) {
        this.answerRepository = answerRepository;
        this.studentRepository = studentRepository;
        this.studyPlanItemRepository = studyPlanItemRepository;
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
    public record EnhancedRecommendation(
            String type,
            String topic,
            String currentDifficulty,
            String suggestedDifficulty,
            double accuracy,
            String trend,
            String reason,
            String action,
            String actionType,
            String deepLink) {
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
    public record Prediction(String topic, String difficulty, double winProbability, String confidence) {
    }

    @Cacheable(value = "UserRecommendationsCache", key = "#userEmail", sync = true)
    public List<EnhancedRecommendation> getRecommendations(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student, PageRequest.of(0, 50));
        if (history.isEmpty()) {
            List<EnhancedRecommendation> fallback = new ArrayList<>();
            fallback.add(new EnhancedRecommendation(
                    "READY_TO_ADVANCE", "Java", "Beginner", "Beginner",
                    0.0, "STABLE",
                    "Welcome! Start your learning journey.",
                    "Begin with a Beginner Java quiz",
                    "PRACTICE",
                    "/dashboard/practice?subject=Java&topic=Object+Oriented+Programming&difficulty=School"));
            return fallback;
        }

        Map<String, List<Answer>> topicStats = new HashMap<>();
        for (Answer answer : history) {
            if (answer.getQuestion() == null) {
                continue;
            }
            String topic = answer.getQuestion().getTopic();
            if (topic == null) {
                continue;
            }

            if (!topicStats.containsKey(topic)) {
                topicStats.put(topic, new ArrayList<>());
            }
            topicStats.get(topic).add(answer);
        }

        List<EnhancedRecommendation> recommendations = new ArrayList<>();

        for (Map.Entry<String, List<Answer>> entry : topicStats.entrySet()) {
            String topic = entry.getKey();
            List<Answer> answers = entry.getValue();
            if (answers.isEmpty()) {
                continue;
            }

            long gradable = 0;
            long correct = 0;
            for (Answer answer : answers) {
                String status = answer.getEvaluationStatus();
                if (isGradableStatus(status)) {
                    gradable++;
                    if ("CORRECT".equals(status)) {
                        correct++;
                    }
                }
            }

            double accuracy = 0.0;
            if (gradable > 0) {
                accuracy = (double) correct / gradable;
            }

            String trend = calculateTrend(answers);
            String commonDifficulty = findMostCommonDifficulty(answers);
            LocalDateTime lastPracticed = findLastPracticedTime(answers);
            long daysSinceLastPractice = ChronoUnit.DAYS.between(lastPracticed, LocalDateTime.now());

            if (daysSinceLastPractice >= 7 && gradable >= 3) {
                recommendations.add(new EnhancedRecommendation(
                        "STALE", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        "Last practiced " + daysSinceLastPractice + " days ago - time for a refresher!",
                        "Quick refresher session",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
                continue;
            }

            if (accuracy < 0.6 && gradable >= 3) {
                recommendations.add(new EnhancedRecommendation(
                        "WEAKNESS", topic, commonDifficulty, "School",
                        accuracy, trend,
                        "Accuracy: " + Math.round(accuracy * 100) + "% - needs focused practice",
                        "Review basics and take a recovery quiz",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=School"));
            } else if ("DECLINING".equals(trend) && gradable >= 6) {
                recommendations.add(new EnhancedRecommendation(
                        "DECLINING", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        "Accuracy: " + Math.round(accuracy * 100) + "% but declining recently",
                        "Do a focused review before moving on",
                        "REVIEW",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
            } else if (accuracy > 0.9 && gradable >= 10) {
                String nextDiff = getNextDifficulty(commonDifficulty);
                recommendations.add(new EnhancedRecommendation(
                        "MASTERED", topic, commonDifficulty, nextDiff,
                        accuracy, trend,
                        "Accuracy: " + Math.round(accuracy * 100) + "% - you have mastered this",
                        "Challenge yourself at " + nextDiff + " level",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(nextDiff)));
            } else if (accuracy >= 0.7 && accuracy <= 0.9 && gradable >= 5) {
                recommendations.add(new EnhancedRecommendation(
                        "READY_TO_ADVANCE", topic, commonDifficulty, commonDifficulty,
                        accuracy, trend,
                        "Accuracy: " + Math.round(accuracy * 100) + "% - almost there",
                        "One more round to solidify your understanding",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(topic) + "&difficulty=" + encode(commonDifficulty)));
            }
        }

        addPlanGapRecommendations(student, topicStats, recommendations);

        recommendations.sort((a, b) -> Integer.compare(getPriority(a.type()), getPriority(b.type())));

        if (recommendations.isEmpty()) {
            recommendations.add(new EnhancedRecommendation(
                    "READY_TO_ADVANCE", "New Topic", "Beginner", "Beginner",
                    0.0, "STABLE",
                    "You are doing great! Keep exploring.",
                    "Try a new topic to expand your skills",
                    "PRACTICE",
                    "/dashboard/practice"));
        }

        return recommendations;
    }

    @Cacheable(value = "UserAiCoachPromptCache", key = "#userEmail", sync = true)
    public String buildAiCoachPromptData(String userEmail) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> recent = answerRepository.findTop20ByStudentOrderBySubmittedAtDesc(student);
        if (recent.isEmpty()) {
            return null;
        }

        Map<String, List<Answer>> byTopic = new HashMap<>();
        for (Answer answer : recent) {
            if (answer.getQuestion() == null || answer.getQuestion().getTopic() == null) {
                continue;
            }

            String topic = answer.getQuestion().getTopic();
            if (!byTopic.containsKey(topic)) {
                byTopic.put(topic, new ArrayList<>());
            }
            byTopic.get(topic).add(answer);
        }

        StringBuilder summary = new StringBuilder();
        summary.append("Student's last 20 practice results:\n");

        for (Map.Entry<String, List<Answer>> entry : byTopic.entrySet()) {
            String topic = entry.getKey();
            List<Answer> answers = entry.getValue();

            long correct = 0;
            long total = 0;

            for (Answer answer : answers) {
                String status = answer.getEvaluationStatus();
                if (isGradableStatus(status)) {
                    total++;
                    if ("CORRECT".equals(status)) {
                        correct++;
                    }
                }
            }

            double accuracyPercent = 0.0;
            if (total > 0) {
                accuracyPercent = ((double) correct / total) * 100.0;
            }

            summary.append("- ")
                    .append(topic)
                    .append(": ")
                    .append(Math.round(accuracyPercent))
                    .append("% accuracy (")
                    .append(correct)
                    .append("/")
                    .append(total)
                    .append(" correct)\n");
        }

        return summary.toString();
    }

    @Cacheable(value = "PredictSuccessCache", key = "#userEmail + '-' + #topic + '-' + #difficulty", sync = true)
    public Prediction predictSuccess(String userEmail, String topic, String difficulty) {
        Student student = studentRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Answer> history = answerRepository.findAllByStudentOrderBySubmittedAtDesc(student, PageRequest.of(0, 50));

        List<Answer> topicHistory = new ArrayList<>();
        for (Answer answer : history) {
            if (answer.getQuestion() == null || answer.getQuestion().getTopic() == null) {
                continue;
            }
            if (answer.getQuestion().getTopic().equalsIgnoreCase(topic)) {
                topicHistory.add(answer);
            }
            if (topicHistory.size() == 20) {
                break;
            }
        }

        if (topicHistory.isEmpty()) {
            return new Prediction(topic, difficulty, 0.5, "LOW_DATA");
        }

        double weightedScore = 0.0;
        double totalWeight = 0.0;

        for (int i = 0; i < topicHistory.size(); i++) {
            Answer answer = topicHistory.get(i);
            double weight = topicHistory.size() - i;
            double score = "CORRECT".equals(answer.getEvaluationStatus()) ? 1.0 : 0.0;

            weightedScore += score * weight;
            totalWeight += weight;
        }

        double probability = totalWeight > 0 ? weightedScore / totalWeight : 0.5;

        if ("Hard".equalsIgnoreCase(difficulty)
                || "Research".equalsIgnoreCase(difficulty)
                || "Post Graduation".equalsIgnoreCase(difficulty)) {
            probability = probability * 0.8;
        }

        String confidence = topicHistory.size() > 10 ? "HIGH" : "MEDIUM";
        return new Prediction(topic, difficulty, probability, confidence);
    }

    private void addPlanGapRecommendations(
            Student student,
            Map<String, List<Answer>> topicStats,
            List<EnhancedRecommendation> recommendations) {
        try {
            List<StudyPlanItem> activePlanItems = studyPlanItemRepository
                    .findAllByStudyPlanStudentIdAndStudyPlanIsCompletedFalse(student.getId());

            Set<String> practicedTopicsLower = new HashSet<>();
            for (String topic : topicStats.keySet()) {
                practicedTopicsLower.add(topic.toLowerCase());
            }

            Set<String> alreadyAdded = new HashSet<>();
            int added = 0;

            for (StudyPlanItem item : activePlanItems) {
                String planTopic = item.getPracticeTopic();
                if (planTopic == null) {
                    continue;
                }

                String lower = planTopic.toLowerCase();
                if (practicedTopicsLower.contains(lower)) {
                    continue;
                }
                if (alreadyAdded.contains(lower)) {
                    continue;
                }

                recommendations.add(new EnhancedRecommendation(
                        "PLAN_GAP", planTopic, "Beginner", "Beginner",
                        0.0, "STABLE",
                        "This topic is in your study plan but has not been practiced yet",
                        "Start practicing to stay on track",
                        "PRACTICE",
                        "/dashboard/practice?topic=" + encode(planTopic)));

                alreadyAdded.add(lower);
                added++;
                if (added == 3) {
                    break;
                }
            }
        } catch (Exception e) {
            System.err.println("Plan gap analysis failed: " + e.getMessage());
        }
    }

    private String calculateTrend(List<Answer> answers) {
        List<Answer> gradable = new ArrayList<>();
        for (Answer answer : answers) {
            if (isGradableStatus(answer.getEvaluationStatus())) {
                gradable.add(answer);
            }
        }

        if (gradable.size() < 6) {
            return "STABLE";
        }

        int recentEnd = Math.min(5, gradable.size());
        List<Answer> recent = gradable.subList(0, recentEnd);

        int priorStart = recentEnd;
        int priorEnd = Math.min(10, gradable.size());
        if (priorStart >= priorEnd) {
            return "STABLE";
        }
        List<Answer> prior = gradable.subList(priorStart, priorEnd);

        double recentAcc = accuracyForList(recent);
        double priorAcc = accuracyForList(prior);

        double diff = recentAcc - priorAcc;
        if (diff > 0.15) {
            return "IMPROVING";
        }
        if (diff < -0.15) {
            return "DECLINING";
        }
        return "STABLE";
    }

    private double accuracyForList(List<Answer> answers) {
        if (answers.isEmpty()) {
            return 0.0;
        }

        int correct = 0;
        for (Answer answer : answers) {
            if ("CORRECT".equals(answer.getEvaluationStatus())) {
                correct++;
            }
        }

        return (double) correct / answers.size();
    }

    private String findMostCommonDifficulty(List<Answer> answers) {
        Map<String, Integer> countByDifficulty = new HashMap<>();

        for (Answer answer : answers) {
            if (answer.getQuestion() == null) {
                continue;
            }

            String difficulty = answer.getQuestion().getDifficulty();
            if (difficulty == null) {
                continue;
            }

            int current = countByDifficulty.getOrDefault(difficulty, 0);
            countByDifficulty.put(difficulty, current + 1);
        }

        String best = "Beginner";
        int bestCount = -1;

        for (Map.Entry<String, Integer> entry : countByDifficulty.entrySet()) {
            if (entry.getValue() > bestCount) {
                bestCount = entry.getValue();
                best = entry.getKey();
            }
        }

        return best;
    }

    private LocalDateTime findLastPracticedTime(List<Answer> answers) {
        LocalDateTime last = null;

        for (Answer answer : answers) {
            LocalDateTime submittedAt = answer.getSubmittedAt();
            if (submittedAt == null) {
                continue;
            }
            if (last == null || submittedAt.isAfter(last)) {
                last = submittedAt;
            }
        }

        return last != null ? last : LocalDateTime.now();
    }

    private int getPriority(String type) {
        if ("WEAKNESS".equals(type))
            return 0;
        if ("DECLINING".equals(type))
            return 1;
        if ("STALE".equals(type))
            return 2;
        if ("PLAN_GAP".equals(type))
            return 3;
        if ("READY_TO_ADVANCE".equals(type))
            return 4;
        if ("MASTERED".equals(type))
            return 5;
        return 99;
    }

    private boolean isGradableStatus(String status) {
        return "CORRECT".equals(status) || "INCORRECT".equals(status) || "CLOSE".equals(status);
    }

    private String getNextDifficulty(String current) {
        if ("School".equals(current))
            return "High School";
        if ("High School".equals(current))
            return "Graduation";
        if ("Graduation".equals(current))
            return "Post Graduation";
        if ("Post Graduation".equals(current))
            return "Research";
        if ("Beginner".equals(current))
            return "Intermediate";
        if ("Intermediate".equals(current))
            return "Advanced";
        return "Hard";
    }

    private String encode(String value) {
        if (value == null) {
            return "";
        }
        return value.replace(" ", "+");
    }
}
